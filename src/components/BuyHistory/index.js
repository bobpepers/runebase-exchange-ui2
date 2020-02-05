import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Typography } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import BuyHistoryView from './BuyHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadBuyHistoryMsg: {
    id: 'load.buyHistory',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class BuyHistory extends Component {
  handleNext = async () => {
    this.props.store.buyHistoryStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.buyHistoryStore.getBuyHistoryInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.buyHistoryStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.buyHistoryStore.getBuyHistoryInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const { store: { buyHistoryStore, wallet } } = this.props;
    const { currentMarket } = wallet;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            Buy
            &nbsp;
            History
            &nbsp;
            (
            {currentMarket}
            )
          </Typography>
        </Card>
        <Trades buyHistoryStore={buyHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!buyHistoryStore.hasLess || buyHistoryStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyHistoryStore.hasMore || buyHistoryStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const Trades = observer(({ buyHistoryStore: { buyHistoryInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadBuyBookMsg} />;
  const buyHistory = (buyHistoryInfo || []).map((event, i) => <BuyHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    buyHistory
  );
});
