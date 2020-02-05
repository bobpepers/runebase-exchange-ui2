import React, { PureComponent } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  Grid,
  Typography } from '@material-ui/core';
import {
  satoshiToDecimal,
  getShortLocalDateTimeString,
  gasToRunebase } from '../../../helpers/utility';

@injectIntl
@inject('store')
class SellHistoryView extends PureComponent {
  renderTrade(amountToken, totalToken, token, baseCurrency) {
    return (
      <Typography className='sold fat'>
        Sell
        &nbsp;
        {amountToken}
        &nbsp;
        {token}
        &nbsp;
        for
        &nbsp;
        {totalToken}
        &nbsp;
        {baseCurrency}
      </Typography>
    );
  }

  render() {
    const {
      event: { txid, boughtTokens, soldTokens, price, token, orderType, time, status, gasUsed, decimals },
      store: { baseCurrencyStore, global: { explorerUrl } },
    } = this.props;
    const amountToken = (satoshiToDecimal(soldTokens, decimals)).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: decimals });
    const totalToken = (satoshiToDecimal(boughtTokens, 8)).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: 8 });
    const actualGasUsed = gasToRunebase(gasUsed);
    const dateTime = getShortLocalDateTimeString(time);

    return (
      <div className={`classes.root ${orderType}`}>
        <Grid container className='myTradeContainer'>
          <Grid item xs={8} className='breakWord'>
            <Typography>
              {dateTime}
            </Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className={`fat ${status}COLOR`}>
              {status}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {this.renderTrade(amountToken, totalToken, token, baseCurrencyStore.baseCurrency.pair)}
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>
              price
            </Typography>
            <Typography className='listInfo'>
              {price}
              &nbsp;
              RUNES
            </Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>
              amount
            </Typography>
            <Typography className='listInfo'>
              {amountToken}
              &nbsp;
              {token}
            </Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>
              gasUsed
            </Typography>
            <Typography className='listInfo'>
              {actualGasUsed}
              &nbsp;
              RUNES
            </Typography>
          </Grid>
          <Grid item xs={12} className='breakWord'>
            <Typography variant="caption" gutterBottom>
              <a
                href={`${explorerUrl}/tx/${txid}`}
                target='_blank'
              >
                {txid}
              </a>
            </Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default SellHistoryView;
