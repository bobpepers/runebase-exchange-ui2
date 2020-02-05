import React, { PureComponent } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import Moment from 'react-moment';
import { injectIntl, defineMessages } from 'react-intl';
import {
  Input,
  Button,
  Grid,
  Typography,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle } from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';
import { Clear } from '@material-ui/icons';
import ExecuteOrderTxConfirmDialog from '../ExecuteOrderTxConfirmDialog';
import { OrderTypeIcon, StatusIcon } from '../../../helpers';
import { satoshiToDecimal, decimalToSatoshi } from '../../../helpers/utility';
import styles from './styles';

const messages = defineMessages({
  executeOrderConfirmMsgSendMsg: {
    id: 'executeOrderConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
class OrderBook extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openError: false,
      exchangeAmount: 0,
      total: '',
      open: false,
    };
  }

  handleClickOpen = async (orderId) => {
    try {
      await this.props.store.global.setSelectedOrderId(orderId); // eslint-disable-line react/destructuring-assignment
      await this.props.store.global.getSelectedOrderInfo(); // eslint-disable-line react/destructuring-assignment
      this.setState({ open: true });
    } catch (error) {
      console.log('error'); /* eslint-disable-line */
    }
  };

  onExecuteOrder = () => {
    this.setState({
      openError: false,
      open: false,
    });
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
      open: false,
    });
  };

  closeAll = () => {
    this.setState({
      open: false,
      openError: false,
    });
    this.props.store.wallet.closeTxDialog(); // eslint-disable-line react/destructuring-assignment
  }

  handleChange = (event, value, price) => {
    const newTotal = value * price;
    this.setState({
      exchangeAmount: value.toFixed(8),
      total: newTotal.toFixed(8),
    });
  };

  changeAmount = (event, price, walletAmount, amountToken, maxSlider) => {
    let total;
    total = event.target.value * price;
    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        exchangeAmount: event.target.value,
        total: total.toFixed(8),
      });
    }
    if (total > walletAmount) {
      total = maxSlider * price;
      this.setState({
        exchangeAmount: maxSlider.toFixed(8),
        total: total.toFixed(8),
      });
    }
    if (event.target.value > maxSlider) {
      total = maxSlider * price;
      this.setState({
        exchangeAmount: maxSlider,
        total: total.toFixed(8),
      });
    }
  }

  render() {
    const {
      classes,
      fullScreen,
      store: {
        wallet,
        global,
        marketStore,
        baseCurrencyStore,
      },
      event: {
        orderId,
        amount,
        price,
        token,
        type,
        status,
      },
    } = this.props;
    const {
      open,
      openError,
      exchangeAmount,
      total,
    } = this.state;
    const isEnabled = wallet.currentAddressSelected !== '';
    const isEnabledButton = wallet.currentAddressSelected !== '' && exchangeAmount > 0;
    const amountTokenLabel = satoshiToDecimal(amount, 8);
    const amountToken = satoshiToDecimal(global.selectedOrderInfo.amount, 8);
    const startAmountToken = satoshiToDecimal(global.selectedOrderInfo.startAmount, 8);
    const filled = satoshiToDecimal((global.selectedOrderInfo.startAmount - global.selectedOrderInfo.amount), 8);
    let totalSelected = amountToken * global.selectedOrderInfo.price;
    totalSelected = totalSelected.toFixed(8).replace(/\.?0+$/, '');
    const exchangeAmountSatoshi = decimalToSatoshi(exchangeAmount, 8);
    const findImage = _.find(marketStore.marketImages, { market: `${wallet.market}` });
    let walletAmount;
    let availableGasAmount;
    let maxSlider;

    if (wallet.currentAddressKey !== '') {
      Object.keys(marketStore.marketInfo).forEach((key) => {
        if (token === marketStore.marketInfo[key].market) {
          walletAmount = wallet.addresses[wallet.currentAddressKey].Exchange[baseCurrencyStore.baseCurrency.pair];
        }
      });
    }
    if (wallet.currentAddressKey !== '') {
      availableGasAmount = wallet.addresses[wallet.currentAddressKey].Wallet[baseCurrencyStore.baseCurrency.pair];
    }

    const maxAmount = walletAmount / price;
    if (maxAmount < totalSelected) {
      maxSlider = maxAmount;
      maxSlider = maxSlider.toFixed(8).replace(/\.?0+$/, '');
    } else {
      maxSlider = amountToken;
    }

    return (
      <div className={`classes.root ${type}`}>
        <Dialog
          open={openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Withdraw
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select an address first.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleClose}
              type='button'
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <div className={type}>
          <div>
            <Grid container className='centerText gridLabelContainer' wrap="nowrap">
              <Grid item xs={9} zeroMinWidth>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item xs={4} zeroMinWidth>
                        <Typography className='listLabel'>
                          orderId
                        </Typography>
                        <Typography className='listInfo'>
                          {orderId}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography className='listLabel'>
                          status
                        </Typography>
                        <Typography className={`fat ${status}COLOR`}>
                          {status}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography className='listLabel'>
                          amount
                        </Typography>
                        <Typography className='listInfo'>
                          {amountTokenLabel}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className='spacingOrdersLabel'>
                    <Grid container>
                      <Grid item xs={4}>
                        <Typography className='listLabel'>
                          token
                        </Typography>
                        <Typography className='listInfo'>
                          {token}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography className='listLabel'>
                          type
                        </Typography>
                        <Typography className={`fat ${type}COLOR`}>
                          {type}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography className='listLabel'>
                          price
                        </Typography>
                        <Typography className='listInfo'>
                          {price}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3} className='buttonCell'>
                <button
                  className="ui positive button"
                  onClick={() => this.handleClickOpen(orderId)}
                  type='button'
                >
                  Buy
                </button>
              </Grid>
            </Grid>
          </div>
        </div>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
          className="xParent"
        >
          <Clear className='cancelIconRed xOrder' onClick={this.handleClose} />
          <DialogTitle id="responsive-dialog-title">
            Order
            &nbsp;
            Id:
            &nbsp;
            {global.selectedOrderInfo.orderId}
          </DialogTitle>
          <DialogContent>
            <div className={classes.dashboardOrderBookWrapper}>
              <Grid container className='centerText xOverflow'>
                <Grid item xs={12}>
                  <Grid container justify="center">
                    <Grid item xs={3}>
                      <p>
                        {global.selectedOrderInfo.token}
                        /
                        {baseCurrencyStore.baseCurrency.pair}
                      </p>
                      <div className='fullwidth'>
                        <img alt={wallet.market} src={`https://ipfs.io/ipfs/${findImage.image}`} />
                      </div>
                    </Grid>
                    <Grid item xs={3} className='inheritHeight'>
                      <p>
                        {global.selectedOrderInfo.type}
                      </p>
                      <OrderTypeIcon orderType={global.selectedOrderInfo.type} />
                    </Grid>
                    <Grid item xs={3} className='inheritHeight'>
                      <p>
                        {global.selectedOrderInfo.status}
                      </p>
                      <StatusIcon status={global.selectedOrderInfo.status} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className='spacingOrderBook vcenter'>
                    <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                      <Typography variant='h6' className='ordersPropertyLabel'>
                        amount
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {amountToken}
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {global.selectedOrderInfo.token}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                      <Typography variant='h6' className='ordersPropertyLabel'>
                        price
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {global.selectedOrderInfo.price}
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {baseCurrencyStore.baseCurrency.pair}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                      <Typography variant='h6' className='ordersPropertyLabel'>
                        total
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {totalSelected}
                      </Typography>
                      <Typography variant='subtitle1' className='ordersPropertyContent inheritHeight'>
                        {baseCurrencyStore.baseCurrency.pair}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                      <Typography variant='h6' className='ordersPropertyLabel'>
                        filled
                      </Typography>
                      <div className='ordersPropertyContent inheritHeight'>
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography variant='subtitle1'>
                              {filled}
                            </Typography>
                          </Grid>
                          <span className='filledDivider'></span>
                          <Grid item xs={12}>
                            <Typography variant='subtitle1'>
                              {startAmountToken}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} className='spacingOrderBook'>
                  <div className="ui horizontal divider">
                    Owner
                  </div>
                  <Typography className={classes.root}>
                    <a href={`${global.explorerUrl}/address/${global.selectedOrderInfo.owner}`}>
                      {global.selectedOrderInfo.owner}
                    </a>
                  </Typography>
                </Grid>
                <Grid item xs={12} className='spacingOrderBook'>
                  <div className="ui horizontal divider">
                    TX ID
                  </div>
                  <Typography className={classes.root}>
                    <a href={`${global.explorerUrl}/tx/${global.selectedOrderInfo.txid}`}>
                      {global.selectedOrderInfo.txid}
                    </a>
                  </Typography>
                </Grid>
                <Grid item xs={6} className='spacingOrderBook'>
                  <Typography variant='subtitle1' className={classes.root}>
                    Created Time
                  </Typography>
                  <Typography>
                    <Moment unix>
                      {global.selectedOrderInfo.time}
                    </Moment>
                  </Typography>
                </Grid>
                <Grid item xs={6} className='spacingOrderBook'>
                  <Typography variant='subtitle1' className={classes.root}>
                    Created BlockNum
                  </Typography>
                  <Typography>
                    {global.selectedOrderInfo.blockNum}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <div className="ui horizontal divider">
                    Trade
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subtitle1' className={classes.root}>
                    {baseCurrencyStore.baseCurrency.pair}
                    &nbsp;
                    Available
                  </Typography>
                  <Typography>
                    {walletAmount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subtitle1' className={classes.root}>
                    Gas Available
                  </Typography>
                  <Typography>
                    {availableGasAmount}
                  </Typography>
                </Grid>
                <div className="ui horizontal divider">
                </div>
                <Typography variant='subtitle1' className={classes.root}>
                  Amount
                </Typography>
                <Grid item xs={12}>
                  <Slider
                    disabled={!isEnabled}
                    className='sliderAmount'
                    max={maxSlider}
                    step={0.00000001}
                    value={exchangeAmount}
                    aria-labelledby="label"
                    onChange={(e, val) => this.handleChange(e, val, price)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    disabled={!isEnabled}
                    className='inputWidth inputOrderSpacing'
                    type="number"
                    step="0.00000001"
                    min="0"
                    max={amountToken}
                    value={exchangeAmount}
                    onChange={(event) => { this.changeAmount(event, price, walletAmount, amountToken, maxSlider); }}
                    name="amount"
                  />
                </Grid>
                <Grid item xs={12}>
                  {total && (
                    <span className='messageStyle'>
                      Buy
                      &nbsp;
                      <span className='fat'>
                        {exchangeAmount}
                      </span>
                      &nbsp;
                      {token}
                      &nbsp;
                      for
                      &nbsp;
                      <span className='fat'>
                        {total}
                      </span>
                      &nbsp;
                      {baseCurrencyStore.baseCurrency.pair}
                    </span>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <div>
                    <button
                      disabled={!isEnabledButton}
                      className='ui positive button buyButton'
                      type='button'
                      onClick={() => {
                        if (wallet.currentAddressSelected === '') {
                          this.addressCheck();
                        } else {
                          const bign = Math.round(exchangeAmountSatoshi);
                          wallet.prepareExecuteOrderExchange(global.selectedOrderInfo.orderId, bign.toString());
                        }
                      }}
                    >
                      Buy
                    </button>
                    <ExecuteOrderTxConfirmDialog
                      onExecuteOrder={this.onExecuteOrder}
                      id={messages.executeOrderConfirmMsgSendMsg.id}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
          </DialogContent>
        </Dialog>
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

export default OrderBook;
