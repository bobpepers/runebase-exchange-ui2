import React, { PureComponent } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import {
  Button,
  Grid,
  Typography,
  withStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CancelOrderTxConfirmDialog from '../CancelOrderTxConfirmDialog';
import { OrderTypeIcon, StatusIcon } from '../../../helpers';
import { satoshiToDecimal } from '../../../helpers/utility';
import styles from './styles';

const messages = defineMessages({
  cancelOrderConfirmMsgSendMsg: {
    id: 'cancelOrderConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @inject('store') @withStyles(styles, { withTheme: true }) class OrderBook extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { openError: false };
  }

  onCancelOrder = () => {
    if (this.props.store.wallet.currentAddressSelected === '') { // eslint-disable-line react/destructuring-assignment
      this.setState({
        openError: true,
      });
    }
  }

  addressCheck = () => {
    if (this.props.store.wallet.currentAddressSelected === '') { // eslint-disable-line react/destructuring-assignment
      this.setState({
        openError: true,
      });
    }
  }

  handleClose = () => {
    this.setState({
      openError: false,
    });
  };

  render() {
    const {
      classes: {
        root,
        dashboardOrderBookWrapper,
      },
      store: {
        wallet,
        marketStore,
        baseCurrencyStore,
        global: {
          explorerUrl,
        },
      },
      order: {
        orderId,
        txid,
        amount,
        startAmount,
        owner,
        blockNum,
        time,
        price,
        token,
        tokenName,
        type,
        status,
      },
    } = this.props;
    const {
      openError,
    } = this.state;
    const amountToken = satoshiToDecimal(amount, 8);
    const startAmountToken = satoshiToDecimal(startAmount, 8);
    const filled = parseFloat((startAmountToken - amountToken).toFixed(8));
    let total = amountToken * price;
    total = total.toFixed(8);
    const findImage = _.find(marketStore.marketImages, { market: `${token}` });
    return (
      <div className={`root ${status}`} style={{ overflow: 'hidden' }}>
        <Dialog
          open={openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Withdraw</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select an address first.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <ExpansionPanel className={status}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container className='centerText' wrap="nowrap">
              <Grid item xs={2} zeroMinWidth>
                <Typography>orderId</Typography>
                <Typography className='fat'>{orderId}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>token</Typography>
                <Typography className='fat'>{token}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>amount</Typography>
                <Typography className='fat'>{amountToken}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>price</Typography>
                <Typography className='fat'>{price}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>type</Typography>
                <Typography className={`fat ${type}COLOR`}>{type}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>status</Typography>
                <Typography className={`fat ${status}COLOR`}>{status}</Typography>
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={dashboardOrderBookWrapper}>

            <Grid container className='centerText'>
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Grid item xs={3}>
                    <p className='fat'>
                      {token}
                      /
                      {baseCurrencyStore.baseCurrency.pair}
                    </p>
                    <div className='fullwidth'>
                      {findImage ? (<img alt={tokenName} src={`https://ipfs.io/ipfs/${findImage.image}`} />) : (<div>Loading...</div>)}
                    </div>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight'>
                    <p className='fat'>{type}</p>
                    <OrderTypeIcon orderType={type} />
                  </Grid>
                  <Grid item xs={3} className='inheritHeight'>
                    <p className='fat'>{status}</p>
                    <StatusIcon status={status} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container className='spacingOrderBook vcenter'>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='h6' className='ordersPropertyLabel'>amount</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{amountToken}</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{token}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='h6' className='ordersPropertyLabel'>price</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{price}</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{baseCurrencyStore.baseCurrency.pair}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='h6' className='ordersPropertyLabel'>total</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{total}</Typography>
                    <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>{baseCurrencyStore.baseCurrency.pair}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='h6' className='ordersPropertyLabel'>filled</Typography>
                    <div className='ordersPropertyContent inheritHeight'>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant='subtitle1'>{filled}</Typography>
                        </Grid>
                        <span className='filledDivider'></span>
                        <Grid item xs={12}>
                          <Typography variant='subtitle1'>{startAmountToken}</Typography>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} className='spacingOrderBook'>
                <Typography variant='subtitle1' className=''>owner:</Typography>
                <Typography className={root}><a href={`${explorerUrl}/address/${owner}`}>{owner}</a></Typography>
              </Grid>
              <Grid item xs={12} className='spacingOrderBook'>
                <Typography variant='subtitle1' className={root}>txid:</Typography>
                <Typography className={root}><a href={`${explorerUrl}/tx/${txid}`}>{txid}</a></Typography>
              </Grid>
              <Grid item xs={6} className='spacingOrderBook'>
                <Typography variant='subtitle1'>created time</Typography>
                <Typography>{time}</Typography>
              </Grid>
              <Grid item xs={6} className='spacingOrderBook'>
                <Typography variant='subtitle1'>created blockNum</Typography>
                <Typography>{blockNum}</Typography>
              </Grid>
              {status !== 'CANCELED' && status !== 'FULFILLED' ? (
                <Grid item xs={12}>
                  <div>
                    <Button onClick={() => wallet.prepareCancelOrderExchange(orderId)} color="primary">
                      Cancel Order
                    </Button>
                    <CancelOrderTxConfirmDialog onCancelOrder={this.onCancelOrder} id={messages.cancelOrderConfirmMsgSendMsg.id} />
                  </div>
                </Grid>
              ) : (
                <div></div>
              )}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

OrderBook.propTypes = {
  orderId: PropTypes.string,
};

OrderBook.defaultProps = {
  orderId: undefined,
};
