import React, { PureComponent } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  Grid,
  Typography } from '@material-ui/core';
import { getShortLocalDateTimeString } from '../../../helpers/utility';

@injectIntl
@inject('store')
class FundRedeemHistoryView extends PureComponent {
  render() {
    const {
      event: { txid, type, token, status, time, amount },
      store: { global: { explorerUrl } },
    } = this.props;
    const dateTime = getShortLocalDateTimeString(time);
    let renderType;
    if (type === 'DEPOSITEXCHANGE') {
      renderType = 'Deposit';
    } else if (type === 'WITHDRAWEXCHANGE') {
      renderType = 'Withdraw';
    }

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
          <Grid item xs={12}>
            <Typography className={`${type} fat`}>
              {renderType}
              &nbsp;
              {amount}
              &nbsp;
              {token}
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

export default FundRedeemHistoryView;
