/* eslint-disable react/destructuring-assignment, react/static-property-placement, react/jsx-wrap-multilines */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withStyles, Snackbar, Typography, Grid } from '@material-ui/core';
import cx from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styles from './styles';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class PendingTxsSnackbar extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    intl: intlShape.isRequired, // eslint-disable-line react/no-typos
  };

  componentDidMount() {
    this.props.store.pendingTxsSnackbar.init();
  }

  render() {
    const {
      isVisible,
      count,
      pendingTransfers,
      pendingBuyOrders,
      pendingSellOrders,
      pendingCancelOrders,
      pendingExecuteOrders,
      pendingWithdrawExchanges,
      pendingDepositExchanges,
    } = this.props.store.pendingTxsSnackbar;
    const { classes, intl } = this.props;

    const pendingCounts = {
      'str.transferTokens': pendingTransfers,
      'str.buyOrder': pendingBuyOrders,
      'str.sellOrder': pendingSellOrders,
      'str.cancelOrder': pendingCancelOrders,
      'str.executeOrder': pendingExecuteOrders,
      'str.withdrawExchange': pendingWithdrawExchanges,
      'str.depositExchange': pendingDepositExchanges,
    };

    if (count === 0) {
      return null;
    }

    return (
      <Snackbar
        className={classes.snackbar}
        open={isVisible}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={
          <Grid container>
            <Grid item xs={11}>
              <Typography variant="caption" className={classes.totalCountText}>
                <FormattedMessage
                  id="pendingTxsSnackbar.youHaveXPendingTransactions"
                  defaultMessage="You have {numOfTxs} pending transaction(s)."
                  values={{ numOfTxs: count }}
                />
              </Typography>
              {Object.entries(pendingCounts).map(([id, amounts]) => amounts.length > 0 && (
                <Typography variant="caption" key={id}>{`${intl.formatMessage({ id })}: ${amounts.length}`}</Typography>
              ))}
              <Typography variant="caption" className={classes.balanceExplanation}>
                <FormattedMessage
                  id="pendingTxsSnackbar.balanceExplanation"
                  defaultMessage="Pending transactions will affect your wallet balances."
                />
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <i
                className={cx(classes.closeIcon, 'icon iconfont icon-ic_close')}
                onClick={() => this.props.store.pendingTxsSnackbar.isVisible = false}
              />
            </Grid>
          </Grid>
        }
      />
    );
  }
}
