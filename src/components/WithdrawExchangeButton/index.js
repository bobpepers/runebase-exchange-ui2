import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { injectIntl, defineMessages } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { FastForward, AccountBalanceWallet } from '@material-ui/icons';
import { TxSentDialog } from 'components';
import RedeemExchangeTxConfirmDialog from '../WithdrawExchangeTxConfirmDialog';

const messages = defineMessages({
  redeemConfirmMsgSendMsg: {
    id: 'redeemConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @inject('store') @observer class WithdrawExchangeButton extends Component {
  constructor(props) {
    super(props);
    this.hasExchange = [];
    this.state = {
      open: false,
      open2: false,
      openError: false,
      amount: 0,
      tokenChoice: '',
      address: '',
      available: '',
    };
  }

  handleClickOpenRedeemChoice = (addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Exchange).forEach((currency) => {
      this.hasExchange[currency] = addresses[currentAddressKey].Exchange[currency] > 0;
    });

    if (currentAddressSelected === '') {
      this.setState({
        open: false,
        open2: false,
        openError: true,
      });
      return;
    }

    this.setState({
      open: true,
      open2: false,
    });
  };

  handleClickOpenRedeemDialog = (event, addresses, currentAddressKey, currentAddressSelected) => {
    const {
      store: {
        wallet: {
          currentTokenDecimals,
        },
      },
    } = this.props;

    currentTokenDecimals(event.currentTarget.value);

    Object.keys(addresses[currentAddressKey].Exchange).forEach((currency) => {
      if (event.currentTarget.value === currency) {
        this.setState({
          tokenChoice: currency,
          available: addresses[currentAddressKey].Exchange[currency],
        });
      }
    });

    this.setState({
      open: false,
      open2: true,
      address: currentAddressSelected,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
      open2: false,
      openError: false,
      amount: '',
    });
  };

  handleChange = () => event => {
    const {
      store: {
        wallet: {
          decimals,
        },
      },
    } = this.props;
    const {
      available,
    } = this.state;

    const regex = new RegExp(`^(?:0|[1-9][0-9]*)(?:\\.[0-9]{1,${decimals}})?$`);

    if (event.target.value === '' || regex.test(event.target.value)) {
      this.setState({
        amount: event.target.value,
      });
    }
    if (event.target.value > available) {
      this.setState({
        amount: available,
      });
    }
  };

  onRedeem = () => {
    this.setState({
      open: false,
      open2: false,
      amount: '',
    });
  }

  closeAll = () => {
    const {
      store: {
        wallet: {
          closeTxDialog,
        },
      },
    } = this.props;
    this.setState({
      open: false,
      open2: false,
      amount: '',
    });
    closeTxDialog();
  }

  render() {
    const {
      store: {
        wallet,
        baseCurrencyStore,
        marketStore: {
          marketInfo,
        },
      },
    } = this.props;
    const {
      openError,
      open,
      open2,
      tokenChoice,
      address,
      amount,
      available,
    } = this.state;
    const isEnabledRedeem = wallet.currentAddressSelected !== '';
    const rows = [];
    const steps = Number(`1e-${wallet.decimals}`).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: wallet.decimals });

    rows.push(<Button
      key='withdrawBaseCurrency'
      value={baseCurrencyStore.baseCurrency.pair}
      disabled={!this.hasExchange[baseCurrencyStore.baseCurrency.pair]}
      onClick={(event) => this.handleClickOpenRedeemDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
    >
      {baseCurrencyStore.baseCurrency.pair}
    </Button>);

    Object.keys(marketInfo).forEach((key) => {
      rows.push(<Button
        key={marketInfo[key].market}
        value={marketInfo[key].market}
        disabled={!this.hasExchange[marketInfo[key].market]}
        onClick={(event) => this.handleClickOpenRedeemDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
      >
        {marketInfo[key].market}
      </Button>);
    });

    return (
      <>
        <div className='positionbutton'>
          <button
            disabled={!isEnabledRedeem}
            className="ui negative button withdrawButton"
            type='button'
            onClick={() => this.handleClickOpenRedeemChoice(wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
          >
            <span className='verticalTextButton rightPadMidBut'>
              Withdraw
            </span>
            <AccountBalanceWallet className='verticalTextButton' />
            <FastForward className='verticalTextButton' />
          </button>
        </div>
        <Dialog
          open={openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Withdraw from Exchange Contract
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select an address first.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Withdraw from Exchange Contract
          </DialogTitle>
          <DialogContent>
          </DialogContent>
          <DialogActions>
            {rows}
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={open2}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title2"
        >
          <DialogTitle id="form-dialog-title2">
            Withdraw
            &nbsp;
            {tokenChoice}
            &nbsp;
            from
            &nbsp;
            Exchange
            &nbsp;
            Contract
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Current
              &nbsp;
              Address:
            </DialogContentText>
            <DialogContentText>
              {address}
            </DialogContentText>
            <DialogContentText>
              Available:
            </DialogContentText>
            <DialogContentText>
              {available}
              &nbsp;
              {tokenChoice}
            </DialogContentText>
            <DialogContentText>
              Amount:
            </DialogContentText>
            <TextField
              id="standard-number"
              className='inputWidth'
              type="number"
              step={steps}
              min={0}
              value={amount}
              onChange={this.handleChange()}
              name="amount"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => wallet.prepareRedeemExchange(address, amount, tokenChoice)} color="primary">
              Withdraw
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <RedeemExchangeTxConfirmDialog onRedeem={this.onRedeem} id={messages.redeemConfirmMsgSendMsg.id} />
        {wallet.txSentDialogOpen && (
          <TxSentDialog
            txid={wallet.txid}
            open={wallet.txSentDialogOpen}
            onClose={this.closeAll}
          />
        )}
      </>
    );
  }
}
