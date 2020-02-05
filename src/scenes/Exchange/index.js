/* eslint-disable react/destructuring-assignment, react/jsx-fragments */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Grid } from '@material-ui/core';
import {
  ExchangeBalance,
  MyOrderBook,
  PriceChart,
  MyTrades,
  Markets,
  MarketInfo,
  WalletBalance,
  BuyOrder,
  SellOrder,
  BuyBook,
  SellBook,
  SellHistory,
  BuyHistory,
  FundRedeemHistory,
  DropDownAddresses,
  WithdrawExchangeButton,
  DepositExchangeButton,
} from 'components';
import Loading from '../../components/EventListLoading';
import '../../style/style.css';

export default @inject('store') @observer class Exchange extends Component {
  render() {
    const { loading } = this.props.store.global;
    if (loading) return <Loading />;
    return (
      <Fragment>
        <Grid container>
          <Grid item xs={12}>
            <DropDownAddresses />
          </Grid>
          <Grid item xs={12}>
            <WalletBalance />
          </Grid>
          <Grid item xs={6}>
            <div className='rotation-wrapper-outer'>
              <div className='rotation-wrapper-inner'>
                <DepositExchangeButton />
              </div>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className='rotation-wrapper-outer'>
              <div className='rotation-wrapper-inner'>
                <WithdrawExchangeButton />
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <ExchangeBalance />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={12} lg={4}>
            <Grid container>
              <Grid item xs={12}>
                <MyOrderBook />
                <MyTrades />
                <FundRedeemHistory />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} lg={8}>
            <Grid container>
              <Grid item xs={12}>
                <Markets />
              </Grid>
              <Grid item xs={12}>
                <MarketInfo />
              </Grid>
              <Grid item xs={12}>
                <PriceChart id="chart" />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12} lg={6}>
                <BuyOrder />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <SellOrder />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12} lg={6}>
                <SellBook />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <BuyBook />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12} lg={6}>
                <BuyHistory />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <SellHistory />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}
