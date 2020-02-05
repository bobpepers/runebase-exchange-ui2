/* eslint-disable react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import {
  Grid,
  withStyles,
  Select,
  MenuItem,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styled from 'styled-components';
import styles from './styles';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class MarketInfo extends Component {
  render() {
    const { store: { wallet, marketStore, baseCurrencyStore } } = this.props;
    const findContractAddress = _.find(marketStore.marketInfo, { market: `${wallet.market}` });
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <div>{wallet.market}/{baseCurrencyStore.baseCurrency.pair}</div>
          </Grid>
          <Grid item xs={12}>
            {findContractAddress ? (<div>Contract Address: {findContractAddress.address}</div>) : (<div>Loading...</div>)}
          </Grid>
          <Grid item xs={3}>
            <ChartTimeTableMenu />
          </Grid>
        </Grid>
      </div>
    );
  }
}

const ChartTimeTableMenu = inject('store')(observer(({ store: { priceChartStore } }) => (
  <NavBarRightButtonContainer>
    <NavBarRightButton>
      <Select
        value={priceChartStore.timeTable}
        onChange={(e) => priceChartStore.changeTimeTable(e.target.value)}
        name="timeTable"
        disableUnderline
      >
        <MenuItem value="1h"><FormattedMessage id="chart.1hour" defaultMessage="1 Hour" /></MenuItem>
        <MenuItem value="3h"><FormattedMessage id="chart.3hour" defaultMessage="3 Hour" /></MenuItem>
        <MenuItem value="6h"><FormattedMessage id="chart.6hour" defaultMessage="6 Hour" /></MenuItem>
        <MenuItem value="12h"><FormattedMessage id="chart.12hour" defaultMessage="12 Hour" /></MenuItem>
        <MenuItem value="d"><FormattedMessage id="chart.daily" defaultMessage="daily" /></MenuItem>
        <MenuItem value="w"><FormattedMessage id="chart.weekly" defaultMessage="weekly" /></MenuItem>
      </Select>
    </NavBarRightButton>
  </NavBarRightButtonContainer>
)));

const NavBarRightButtonContainer = styled.div`
  height: 30px;
  line-height: 30px;
  color: white;
  text-align: center;
  padding-left: 20px;
  padding-right: 20px;
  border-left: 1px solid rgba(0,0,0,0.2);
  border-top: 1px solid rgba(0,0,0,0.2);
  border-right: 1px solid rgba(0,0,0,0.2);
`;
const NavBarRightButton = styled.div`
  height: 30px;
  margin: 5px auto;
  line-height: 30px;
`;
