import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Typography } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import OrderBook from './OrderBook';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadBuyBookMsg: {
    id: 'load.buyBook',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class BuyBook extends Component {
  handleNext = async () => {
    this.props.store.buyStore.skip += 5; // eslint-disable-line react/destructuring-assignment
    this.props.store.buyStore.getBuyOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.buyStore.skip -= 5; // eslint-disable-line react/destructuring-assignment
    this.props.store.buyStore.getBuyOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const { store: { buyStore, wallet } } = this.props;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            People
            &nbsp;
            Buying
            &nbsp;
            {wallet.market}
          </Typography>
        </Card>
        <Events buyStore={buyStore} />
        <div className='centerText'>
          <button
            disabled={!buyStore.hasLess || buyStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyStore.hasMore || buyStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const Events = observer(({ buyStore: { buyOrderInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadBuyBookMsg} />;
  const events = (buyOrderInfo || []).map((event, i) => <OrderBook key={i} index={i} event={event} />); // eslint-disable-line
  return (
    events
  );
});
