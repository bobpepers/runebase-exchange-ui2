import React, { PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  Grid,
  Typography } from '@material-ui/core';
import {
  satoshiToDecimal,
  gasToRunebase,
  getShortLocalDateTimeString } from '../../../helpers/utility';

@injectIntl
@inject('store')
class MyTradesView extends PureComponent {
  renderTrade(from, to, myaddress, amountToken, totalToken, token, orderType, baseCurrency) {
    if (to === myaddress && orderType === 'SELLORDER') {
      return (
        <Typography className='sold fat'>
          Sell&nbsp;
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
    if (to === myaddress && orderType === 'BUYORDER') {
      return (
        <Typography className='bought fat'>
          Buy
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
    if (from === myaddress && orderType === 'SELLORDER') {
      return (
        <Typography className='bought fat'>
          Buy
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
    if (from === myaddress && orderType === 'BUYORDER') {
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
  }

  render() {
    const {
      store: { wallet, baseCurrencyStore, global: { explorerUrl } },
      event: { txid, status, from, to, boughtTokens, soldTokens, price, token, orderType, time, gasUsed, decimals },
    } = this.props;
    const amountToken = (satoshiToDecimal(soldTokens, decimals)).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: decimals });
    const totalToken = (satoshiToDecimal(boughtTokens, 8)).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits: 8 });
    const myaddress = wallet.addresses[wallet.currentAddressKey].address;
    const actualGasUsed = gasToRunebase(gasUsed);
    const dateTime = getShortLocalDateTimeString(time);

    return (
      <div className={`${status}`}>
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
          <Grid item xs={12} className='fat'>
            {this.renderTrade(from, to, myaddress, amountToken, totalToken, token, orderType, baseCurrencyStore.baseCurrency.pair)}
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

export default MyTradesView;
