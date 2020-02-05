import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import { Card, Typography } from '@material-ui/core';
import MyTradesView from './MyTradesView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadMyTradesMsg: {
    id: 'load.allMyTrades',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class MyTrades extends Component {
  handleNext = async () => {
    this.props.store.myTradeStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.myTradeStore.getMyTradeInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.myTradeStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.myTradeStore.getMyTradeInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const {
      store: {
        myTradeStore,
      },
    } = this.props;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            My Trades
          </Typography>
        </Card>
        <Trades myTradeStore={myTradeStore} />
        <div className='centerText'>
          <button
            disabled={!myTradeStore.hasLess || myTradeStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!myTradeStore.hasMore || myTradeStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const Trades = observer(({ myTradeStore: { myTradeInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadFundRedeemMsg} />;
  const myTrades = (myTradeInfo || []).map((event, i) => <MyTradesView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    myTrades
  );
});
