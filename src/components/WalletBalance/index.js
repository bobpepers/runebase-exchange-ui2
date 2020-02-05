import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  Typography,
  Card,
  Grid,
  withStyles,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './styles';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class WalletBalance extends Component {
  render() {
    const {
      classes,
      store: {
        wallet,
        baseCurrencyStore,
        fundRedeemHistoryStore,
      },
    } = this.props;
    const rows = [];
    if (wallet.currentAddressKey !== '') {
      console.log(wallet.addresses[wallet.currentAddressKey].Wallet);
      Object.keys(wallet.addresses[wallet.currentAddressKey].Wallet).forEach((key) => {
        if (key === baseCurrencyStore.baseCurrency.pair) {
          rows.push(<Grid item xs={3} key={key}>
            <Typography variant="body2">
              {key}
              (GAS)
            </Typography>
            <Typography variant="body2">
              {wallet.addresses[wallet.currentAddressKey].Wallet[key]}
            </Typography>
            {(() => {
              if (fundRedeemHistoryStore.pendingDepositAmount[key] > 0) {
                return (
                  <Typography variant="body2" className="positiveChange">
                    (
                    +
                    {fundRedeemHistoryStore.pendingDepositAmount[key]}
                    )
                  </Typography>
                );
              }
              if (fundRedeemHistoryStore.pendingDepositAmount[key] < 0) {
                return (
                  <Typography variant="body2" className="negativeChange">
                    (
                    {fundRedeemHistoryStore.pendingDepositAmount[key]}
                    )
                  </Typography>
                );
              }
            })()}
          </Grid>);
        } else {
          rows.push(<Grid item xs={3} key={key}>
            <Typography variant="body2">
              {key}
            </Typography>
            <Typography variant="body2">
              {wallet.addresses[wallet.currentAddressKey].Wallet[key]}
            </Typography>
            {(() => {
              if (fundRedeemHistoryStore.pendingDepositAmount[key] > 0) {
                return (
                  <Typography variant="body2" className="positiveChange">
                    (
                    +
                    {fundRedeemHistoryStore.pendingDepositAmount[key]}
                    )
                  </Typography>
                );
              }
              if (fundRedeemHistoryStore.pendingDepositAmount[key] < 0) {
                return (
                  <Typography variant="body2" className="negativeChange">
                    (
                    {fundRedeemHistoryStore.pendingDepositAmount[key]}
                    )
                  </Typography>
                );
              }
            })()}
          </Grid>);
        }
      });
    }
    return (
      <>
        <Card className={classes.dashboardOrderBookTitle}>
          <Typography color='textPrimary'>
            My Wallet Balances
          </Typography>
        </Card>
        <Grid container>
          {(() => {
            if (wallet.currentAddressKey !== '') {
              return (
                <Grid item xs={12}>
                  <Card className={classes.dashboardOrderBook}>
                    <Grid container className='marginTopBot fat'>
                      {rows}
                    </Grid>
                  </Card>
                </Grid>
              );
            }
            return (
              <Grid item xs={12}>
                <Card className={classes.dashboardOrderBook}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography color='textPrimary'>
                        ...
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            );
          })()}
        </Grid>
      </>
    );
  }
}
