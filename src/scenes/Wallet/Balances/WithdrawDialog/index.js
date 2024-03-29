/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  withStyles,
  FormControl,
  FormHelperText,
} from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { Token } from 'constants';

import styles from './styles';


const messages = defineMessages({
  to: {
    id: 'str.to',
    defaultMessage: 'To',
  },
  amount: {
    id: 'str.amount',
    defaultMessage: 'Amount',
  },
  youCanWithdraw: {
    id: 'withdrawDialog.youCanWithdraw',
    defaultMessage: 'You can withdraw up to:',
  },
  confirmSendMsg: {
    id: 'txConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class WithdrawDialog extends Component {
  static propTypes = {
    intl: intlShape.isRequired, // eslint-disable-line react/no-typos
    classes: PropTypes.object.isRequired,
    dialogVisible: PropTypes.bool.isRequired,
    walletAddress: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onWithdraw: PropTypes.func.isRequired,
  };

  static defaultProps = {
    walletAddress: undefined,
  };

  render() {
    const { dialogVisible, walletAddress, onClose, store: { wallet } } = this.props;

    if (!walletAddress) {
      return null;
    }

    return (
      <Dialog
        open={dialogVisible}
        onEnter={wallet.resetWithdrawDialog}
        onClose={onClose}
      >
        <DialogTitle>
          <FormattedMessage id="withdrawDialog.title" defaultMessage="Withdraw" />
        </DialogTitle>
        <DialogContent>
          <FromToField walletAddress={walletAddress} />
          <AmountField />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            <FormattedMessage id="str.close" defaultMessage="Close" />
          </Button>
          <Button color="primary" onClick={wallet.prepareWithdraw.bind(this, walletAddress)} disabled={wallet.withdrawDialogHasError}>
            <FormattedMessage id="withdrawDialog.send" defaultMessage="Send" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
class FromToField extends Component {
  render() {
    const { classes, walletAddress, intl, store: { wallet } } = this.props;
    const { toAddress } = wallet;

    return (
      <div>
        <Typography variant="body1" className={classes.fromLabel}>
          <FormattedMessage id="str.from" defaultMessage="From" />
        </Typography>
        <Typography variant="h6" className={classes.fromAddress}>{walletAddress}</Typography>
        <div className={classes.toAddressInputContainer}>
          <TextField
            autoFocus
            margin="dense"
            id="toAddress"
            label={intl.formatMessage(messages.to)}
            type="string"
            fullWidth
            value={toAddress}
            onChange={e => wallet.toAddress = e.target.value}
            onBlur={wallet.validateWithdrawDialogWalletAddress}
            error={wallet.withdrawDialogError.walletAddress !== ''}
            required
          />
          {!!wallet.withdrawDialogError.walletAddress && <FormHelperText error>{intl.formatMessage({ id: wallet.withdrawDialogError.walletAddress })}</FormHelperText>}
        </div>
      </div>
    );
  }
}

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
class AmountField extends Component {
  render() {
    const {
      classes,
      intl,
      store: { wallet, baseCurrencyStore, marketStore },
    } = this.props;

    const withdrawAmountText = intl.formatMessage(messages.youCanWithdraw);
    const rows = [];

    rows.push(<MenuItem value={baseCurrencyStore.baseCurrency.pair}>{baseCurrencyStore.baseCurrency.pair}</MenuItem>);

    Object.keys(marketStore.marketInfo).forEach((key) => {
      rows.push(<MenuItem value={marketStore.marketInfo[key].market}>{marketStore.marketInfo[key].market}</MenuItem>);
    });

    return (
      <div>
        <div className={classes.amountInputContainer}>
          <TextField
            margin="dense"
            id="amount"
            label={intl.formatMessage(messages.amount)}
            type="number"
            className={classes.amountInput}
            value={wallet.withdrawAmount}
            onChange={e => wallet.withdrawAmount = e.target.value}
            onBlur={wallet.validateWithdrawDialogAmount}
            error={wallet.withdrawDialogError.withdrawAmount !== ''}
            required
          />
          <Select
            value={wallet.selectedToken}
            onChange={e => wallet.selectedToken = e.target.value} // eslint-disable-line
            onBlur={wallet.validateWithdrawDialogAmount}
            inputProps={{ name: 'selectedToken', id: 'selectedToken' }}
          >
            {rows}
          </Select>
          {!!wallet.withdrawDialogError.withdrawAmount && <FormHelperText error>{intl.formatMessage({ id: wallet.withdrawDialogError.withdrawAmount })}</FormHelperText>}
        </div>
        <Typography variant="body1">
          {`${withdrawAmountText} ${wallet.lastAddressWithdrawLimit[wallet.selectedToken]}`}
        </Typography>
      </div>
    );
  }
}
