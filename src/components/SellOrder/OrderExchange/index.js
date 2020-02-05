/* eslint-disable lines-between-class-members, react/destructuring-assignment, operator-linebreak, react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { injectIntl, defineMessages } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { TxSentDialog } from 'components';
import SellOrderExchangeTxConfirmDialog from '../SellOrderExchangeTxConfirmDialog';

const messages = defineMessages({
  sellOrderConfirmMsgSendMsg: {
    id: 'sellOrderConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @inject('store') @observer class OrderExchange extends Component {
  constructor(props) {
    super(props);
    this.state = { openError: false };
  }
  onOrder = () => {
    this.setState({
      openError: false,
    });
  }
  addressCheck = () => {
    if (this.props.store.wallet.currentAddressSelected === '') {
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

  closeAll = () => {
    this.props.store.wallet.closeTxDialog();
  }

  render() {
    const { store: { wallet } } = this.props;
    const isEnabled =
      this.props.amount < this.props.tokenAmount &&
      this.props.tokenAmount > 0 &&
      this.props.amount > 0;

    return (
      <div>
        <Button
          disabled={!isEnabled}
          onClick={() => {
            if (this.props.store.wallet.currentAddressSelected === '') {
              this.addressCheck();
            } else {
              wallet.prepareSellOrderExchange(this.props.price, this.props.amount, wallet.currentMarket, this.props.orderType, this.props.total);
            }
          }}
          color="primary"
        >
          Sell {wallet.currentMarket}
        </Button>
        <SellOrderExchangeTxConfirmDialog onOrder={this.onOrder} id={messages.sellOrderConfirmMsgSendMsg.id} />
        <Dialog
          open={this.state.openError}
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
        {wallet.txSentDialogOpen && (
          <TxSentDialog
            txid={wallet.txid}
            open={wallet.txSentDialogOpen}
            onClose={this.closeAll}
          />
        )}
      </div>
    );
  }
}
