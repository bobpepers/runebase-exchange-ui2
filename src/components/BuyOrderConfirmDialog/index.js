/* eslint-disable react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import {
  withStyles,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import styles from './styles';

const messages = defineMessages({
  buyOrderConfirmMessageMsg: {
    id: 'orderConfirm.message',
    defaultMessage: 'You are about to {txDesc} for {txAmount} {txToken}. Please click OK to continue.',
  },
  buyOrderConfirmMessageWithFeeMsg: {
    id: 'orderConfirm.messageWithFee',
    defaultMessage: 'You are about to {txDesc} for {txAmount} {txToken} with a maximum transaction fee of {txFee} RUNES. Any unused transaction fees will be refunded to you. Please click OK to continue.',
  },
  strTypeMsg: {
    id: 'str.type',
    defaultMessage: 'Type',
  },
  strAmountMsg: {
    id: 'str.amount',
    defaultMessage: 'Amount',
  },
  strPriceMsg: {
    id: 'str.price',
    defaultMessage: 'price',
  },
  strTotalMsg: {
    id: 'str.total',
    defaultMessage: 'total',
  },
  strFeeMsg: {
    id: 'str.fee',
    defaultMessage: 'Gas Fee (RUNES)',
  },
  strGasLimitMsg: {
    id: 'str.gasLimit',
    defaultMessage: 'Gas Limit',
  },
});

/**
 * Shows the transactions that the user is approving before executing them. Some txs require 2 different txs.
 * USED IN:
 * - wallet
 * - event page
 * - create event
 */
export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class BuyOrderConfirmDialog extends Component {
  render() {
    const { open, txFees, onConfirm, onClose, txAmount, txToken, txDesc, txPrice, txTotal } = this.props;
    const { classes, intl: { formatMessage } } = this.props;
    const txFee = _.sumBy(txFees, ({ gasCost }) => gasCost ? parseFloat(gasCost) : 0);
    let confirmMessage = formatMessage(messages.buyOrderConfirmMessageMsg, { txDesc, txAmount, txToken, txPrice, txTotal });
    if (txFee) {
      confirmMessage = formatMessage(messages.buyOrderConfirmMessageWithFeeMsg, { txDesc, txAmount, txToken, txFee, txPrice, txTotal });
    }
    if (!open) {
      return null;
    }

    return (
      <Dialog maxWidth={false} open={open}>
        <DialogTitle>
          <FormattedMessage id="buyOrderConfirm.title" defaultMessage="Please Confirm Your Buy Order" />
        </DialogTitle>
        <DialogContent>
          {confirmMessage}
          {Boolean(txFees.length) && (
            <Table className={classes.costTable}>
              <TableHead>
                <TableRow>
                  <Cell id={messages.strTypeMsg.id} defaultMessage={messages.strTypeMsg.defaultMessage} />
                  <Cell id={messages.strAmountMsg.id} defaultMessage={messages.strAmountMsg.defaultMessage} />
                  <Cell id={messages.strPriceMsg.id} defaultMessage={messages.strPriceMsg.defaultMessage} />
                  <Cell id={messages.strTotalMsg.id} defaultMessage={messages.strTotalMsg.defaultMessage} />
                  <Cell id={messages.strFeeMsg.id} defaultMessage={messages.strFeeMsg.defaultMessage} />
                  <Cell id={messages.strGasLimitMsg.id} defaultMessage={messages.strGasLimitMsg.defaultMessage} />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{txFees[0].type}</TableCell>
                  <TableCell>{txFees[0].amount} {txFees[0].token}</TableCell>
                  <TableCell>{txPrice} RUNES</TableCell>
                  <TableCell>{txTotal} RUNES</TableCell>
                  <TableCell>{txFees[0].gasCost}</TableCell>
                  <TableCell>{txFees[0].gasLimit}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={onClose}>
            <FormattedMessage id="str.cancel" defaultMessage="Cancel" />
          </Button>
          <Button color="primary" onClick={onConfirm}>
            <FormattedMessage id="str.confirm" defaultMessage="OK" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const Cell = injectIntl(({ id, defaultMessage, intl }) => (
  <TableCell>
    {intl.formatMessage({ id, defaultMessage })}
  </TableCell>
));
