import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Typography } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import SellHistoryView from './SellHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadSellHistoryMsg: {
    id: 'load.sellHistory',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class SellHistory extends Component {
  handleNext = async () => {
    this.props.store.sellHistoryStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.sellHistoryStore.getSellHistoryInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.sellHistoryStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.sellHistoryStore.getSellHistoryInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const { store: { sellHistoryStore, wallet } } = this.props;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            Sell
            &nbsp;
            History
            &nbsp;
            (
            {wallet.currentMarket}
            )
          </Typography>
        </Card>
        <Trades sellHistoryStore={sellHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!sellHistoryStore.hasLess || sellHistoryStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!sellHistoryStore.hasMore || sellHistoryStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const Trades = observer(({ sellHistoryStore: { sellHistoryInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadSellHistoryMsg} />;
  const sellHistory = (sellHistoryInfo || []).map((event, i) => <SellHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    sellHistory
  );
});
