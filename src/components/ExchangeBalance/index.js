import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  Typography,
  Card,
  Grid } from '@material-ui/core';

export default @injectIntl @inject('store') @observer class ExchangeBalance extends Component {
  render() {
    const {
      store: {
        wallet,
        fundRedeemHistoryStore,
      },
    } = this.props;
    const rows = [];
    if (wallet.currentAddressKey !== '') {
      Object.keys(wallet.addresses[wallet.currentAddressKey].Exchange).forEach((key) => {
        const isActive = (wallet.market === key) ? 'MarketBalanceActive' : 'NotSoActive';
        rows.push(<Grid item xs={3} key={key}>
          <Typography variant="body2" className={`${isActive}`}>
            {key}
          </Typography>
          <Typography variant="body2" className={`${isActive}`}>
            {wallet.addresses[wallet.currentAddressKey].Exchange[key]}
          </Typography>
          {(() => {
            if (fundRedeemHistoryStore.pendingWithdrawAmount[key] > 0) {
              return (
                <Typography variant="body2" className="positiveChange">
                  (
                  +
                  {fundRedeemHistoryStore.pendingWithdrawAmount[key]}
                  )
                </Typography>
              );
            }
            if (fundRedeemHistoryStore.pendingWithdrawAmount[key] < 0) {
              return (
                <Typography variant="body2" className="negativeChange">
                  (
                  {fundRedeemHistoryStore.pendingWithdrawAmount[key]}
                  )
                </Typography>
              );
            }
          })()}
        </Grid>);
      });
    }

    return (
      <>
        <Grid container>
          <Grid container>
            <Grid item xs={12}>
              <Card className='dashboardOrderBookTitle'>
                <Typography color='textPrimary'>
                  My Exchange Balances
                </Typography>
              </Card>
            </Grid>
            {(() => {
              if (wallet.currentAddressKey !== '') {
                return (
                  <Grid item xs={12} className='dashboardOrderBook'>
                    <Card className='dashboardOrderBook fat'>
                      <Grid container className='marginTopBot'>
                        {rows}
                      </Grid>
                    </Card>
                  </Grid>
                );
              }
              return (
                <Grid item xs={12}>
                  <Card>
                    <Grid container>
                      <Grid item xs={12} className='dashboardOrderBook'>
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
        </Grid>
      </>
    );
  }
}
