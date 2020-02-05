import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Tab, Tabs, AppBar, Typography } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import SwipeableViews from 'react-swipeable-views';
import LoadingElement from '../Loading';
import OrderBook from './OrderBook';

const messages = defineMessages({
  loadCurrentOrdersMsg: {
    id: 'load.currentOrders',
    defaultMessage: 'loading',
  },
  loadFulfilledOrdersMsg: {
    id: 'load.fulfilledOrders',
    defaultMessage: 'loading',
  },
  loadCanceledOrdersMsg: {
    id: 'load.canceledOrders',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class MyOrderBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  handleActiveNext = async () => {
    this.props.store.activeOrderStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.activeOrderStore.getActiveOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleActivePrevious = async () => {
    this.props.store.activeOrderStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.activeOrderStore.getActiveOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleFulfilledNext = async () => {
    this.props.store.fulfilledOrderStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.fulfilledOrderStore.getFulfilledOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleFulfilledPrevious = async () => {
    this.props.store.fulfilledOrderStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.fulfilledOrderStore.getFulfilledOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleCanceledNext = async () => {
    this.props.store.canceledOrderStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.canceledOrderStore.getCanceledOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleCanceledPrevious = async () => {
    this.props.store.canceledOrderStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.canceledOrderStore.getCanceledOrderInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const {
      store: {
        activeOrderStore,
        fulfilledOrderStore,
        canceledOrderStore,
      },
    } = this.props;
    const { value } = this.state;

    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            My Orders
          </Typography>
        </Card>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Current" />
            <Tab label="FulFilled" />
            <Tab label="Canceled" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis='x'
          index={value}
          onChangeIndex={this.handleChangeIndex}
          enableMouseEvents='true'
        >
          <Orders activeOrderStore={activeOrderStore} />
          <OrdersFulFilled fulfilledOrderStore={fulfilledOrderStore} />
          <OrdersCanceled canceledOrderStore={canceledOrderStore} />
        </SwipeableViews>
        <div className='centerText'>
          {value === 0 && (
            <div>
              <button
                type='button'
                disabled={!activeOrderStore.hasLess || activeOrderStore.loading}
                onClick={this.handleActivePrevious}
              >
                Previous Page
              </button>
              <button
                type='button'
                onClick={this.handleActiveNext}
                disabled={!activeOrderStore.hasMore || activeOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          )}
          {value === 1 && (
            <div>
              <button
                type='button'
                disabled={!fulfilledOrderStore.hasLess || fulfilledOrderStore.loading}
                onClick={this.handleFulfilledPrevious}
              >
                Previous Page
              </button>
              <button
                type='button'
                onClick={this.handleFulfilledNext}
                disabled={!fulfilledOrderStore.hasMore || fulfilledOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          )}
          {value === 2 && (
            <div>
              <button
                type='button'
                disabled={!canceledOrderStore.hasLess || canceledOrderStore.loading}
                onClick={this.handleCanceledPrevious}
              >
                Previous Page
              </button>
              <button
                type='button'
                onClick={this.handleCanceledNext}
                disabled={!canceledOrderStore.hasMore || canceledOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </>
    );
  }
}

const Orders = observer(({ activeOrderStore: { activeOrderInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadCurrentOrdersMsg} />;
  const activeOrders = (activeOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    activeOrders
  );
});

const OrdersFulFilled = observer(({ fulfilledOrderStore: { fulfilledOrderInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadFulfilledOrdersMsg} />;
  const filledOrders = (fulfilledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    filledOrders
  );
});

const OrdersCanceled = observer(({ canceledOrderStore: { canceledOrderInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadCanceledOrdersMsg} />;
  const canceledOrders = (canceledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    canceledOrders
  );
});
