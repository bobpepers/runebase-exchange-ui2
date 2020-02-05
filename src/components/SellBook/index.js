import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Typography } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import OrderBook from './OrderBook';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadSellBookMsg: {
    id: 'load.sellBook',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class SellBook extends Component {
  handleNext = async () => {
    this.props.store.sellStore.skip += 5; // eslint-disable-line react/destructuring-assignment
    this.props.store.sellStore.getSellOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.sellStore.skip -= 5; // eslint-disable-line react/destructuring-assignment
    this.props.store.sellStore.getSellOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const { store: { sellStore, wallet } } = this.props;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            People
            &nbsp;
            Selling
            &nbsp;
            {wallet.market}
          </Typography>
        </Card>
        <SellOrders sellStore={sellStore} />
        <div className='centerText'>
          <button
            disabled={!sellStore.hasLess || sellStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!sellStore.hasMore || sellStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const SellOrders = observer(({ sellStore: { sellOrderInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadSellBookMsg} />;
  const events = (sellOrderInfo || []).map((event, i) => <OrderBook key={i} index={i} event={event} />); // eslint-disable-line
  return (
    events
  );
});
