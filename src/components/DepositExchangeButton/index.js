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
import { FastRewind, AccountBalance } from '@material-ui/icons';
import { TxSentDialog } from 'components';
import DepositExchangeTxConfirmDialog from '../DepositExchangeTxConfirmDialog';

const messages = defineMessages({
  fundConfirmMsgSendMsg: {
    id: 'fundConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @inject('store') @observer class DepositExchangeButton extends Component {
  constructor(props) {
    super(props);
    this.hasWallet = [];
    this.state = {
      open: false,
      open2: false,
      openError: false,
      amount: '',
      tokenChoice: '',
      address: '',
      available: '',
    };
  }

  handleClickOpenDepositChoice = (addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Wallet).forEach((depositChoice) => {
      this.hasWallet[depositChoice] = addresses[currentAddressKey].Wallet[depositChoice] > 0;
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

  handleClickOpenDepositDialog = async (event, addresses, currentAddressKey, currentAddressSelected) => {
    const {
      store: {
        wallet: {
          currentTokenDecimals,
        },
      },
    } = this.props;

    currentTokenDecimals(event.currentTarget.value);

    Object.keys(addresses[currentAddressKey].Wallet).forEach((currency) => {
      if (event.currentTarget.value === currency) {
        console.log(event.currentTarget.value);
        this.setState({
          tokenChoice: currency,
          available: addresses[currentAddressKey].Wallet[currency],
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
    // this.props.store.wallet.hasEnoughGasCoverage = false;
    this.setState({
      open: false,
      open2: false,
      openError: false,
      amount: '',
      tokenChoice: '',
      address: '',
      available: '',
    });
  };

  handleChange = () => event => {
    const {
      store: {
        wallet: {
          decimals,
        },
        baseCurrencyStore: {
          baseCurrency: {
            pair,
          },
        },
      },
    } = this.props;
    const {
      available,
      tokenChoice,
    } = this.state;

    const onlyNumbers = new RegExp(`^(?:0|[1-9][0-9]*)(?:\\.[0-9]{1,${decimals}})?$`);
    console.log(event.target.value);

    if (event.target.value === '' || (onlyNumbers.test(event.target.value))) {
      this.setState({
        amount: event.target.value,
      });
    }

    if (Number(event.target.value) > Number(available)) {
      this.setState({
        amount: available,
      });
    }

    // Keep atleast 2 RUNES for gasCoverage.
    if (tokenChoice === pair) {
      if (Number(available) > 2 && Number(available) < Number(event.target.value)) {
        this.setState({
          amount: Number(available) - 2,
        });
      }
    }
  };

  onWithdraw = () => {
    this.setState({
      open: false,
      open2: false,
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
      amount,
      available,
      tokenChoice,
      address,
    } = this.state;
    const isEnabledFund = wallet.currentAddressSelected !== '';
    const rows = [];
    const steps = Number(`1e-${wallet.decimals}`).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: wallet.decimals });

    rows.push(<Button
      key='depositBaseCurrency'
      value={baseCurrencyStore.baseCurrency.pair}
      disabled={!this.hasWallet[baseCurrencyStore.baseCurrency.pair]}
      onClick={(event) => this.handleClickOpenDepositDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
    >
      {baseCurrencyStore.baseCurrency.pair}
    </Button>);

    Object.keys(marketInfo).forEach((key) => {
      rows.push(<Button
        key={marketInfo[key].market}
        value={marketInfo[key].market}
        disabled={!this.hasWallet[marketInfo[key].market]}
        onClick={(event) => this.handleClickOpenDepositDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
      >
        {marketInfo[key].market}
      </Button>);
    });

    return (
      <div className='positionbutton'>
        <button
          disabled={!isEnabledFund}
          className="ui positive button depositButton"
          type='button'
          onClick={() => this.handleClickOpenDepositChoice(wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
        >
          <FastRewind className='verticalTextButton' />
          <AccountBalance className='verticalTextButton' />
          <span className='verticalTextButton leftPadMidBut'>
            Deposit
          </span>
        </button>

        <Dialog
          open={openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Deposit to Exchange Contract
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
            Deposit to Exchange Contract
          </DialogTitle>
          <DialogActions>
            {rows}
            <Button onClick={this.handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={open2}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title2"
        >
          <DialogTitle id="form-dialog-title2">
            Deposit
            &nbsp;
            {tokenChoice}
            &nbsp;
            to
            &nbsp;
            Exchange
            &nbsp;
            Contract
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Current Address:
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
              max={available}
              value={amount}
              onChange={this.handleChange()}
              name="amount"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => wallet.prepareDepositExchange(address, amount, tokenChoice)} color="primary">
              Deposit
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={wallet.hasEnoughGasCoverage}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title2"
        >
          <DialogTitle id="form-dialog-title2">
            Warning
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              You need to leave atleast 2 RUNES in your wallet to cover GAS fees.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <DepositExchangeTxConfirmDialog onWithdraw={this.onWithdraw} id={messages.fundConfirmMsgSendMsg.id} />
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
