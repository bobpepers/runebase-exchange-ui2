import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import { Card, Typography } from '@material-ui/core';
import FundRedeemHistoryView from './FundRedeemHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadFundRedeemMsg: {
    id: 'load.allOrders',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class FundRedeemHistory extends Component {
  handleNext = async () => {
    this.props.store.fundRedeemHistoryStore.skip += 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.fundRedeemHistoryStore.getFundRedeemInfo(); // eslint-disable-line react/destructuring-assignment
  }

  handlePrevious = async () => {
    this.props.store.fundRedeemHistoryStore.skip -= 10; // eslint-disable-line react/destructuring-assignment
    this.props.store.fundRedeemHistoryStore.getFundRedeemInfo(); // eslint-disable-line react/destructuring-assignment
  }

  render() {
    const { store: { fundRedeemHistoryStore } } = this.props;
    return (
      <>
        <Card className='dashboardOrderBookTitle'>
          <Typography color='textPrimary'>
            Fund/Redeem History
          </Typography>
        </Card>
        <History fundRedeemHistoryStore={fundRedeemHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!fundRedeemHistoryStore.hasLess || fundRedeemHistoryStore.loading}
            onClick={this.handlePrevious}
            type='button'
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!fundRedeemHistoryStore.hasMore || fundRedeemHistoryStore.loading}
            type='button'
          >
            Next Page
          </button>
        </div>
      </>
    );
  }
}

const History = observer(({ fundRedeemHistoryStore: { fundRedeemInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadFundRedeemMsg} />;
  const fundRedeem = (fundRedeemInfo || []).map((event, i) => <FundRedeemHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    fundRedeem
  );
});
