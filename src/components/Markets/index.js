import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import {
  Typography,
  Card,
  withStyles,
} from '@material-ui/core';
import MarketView from './MarketView';
import LoadingElement from '../Loading';
import styles from '../styles';

const messages = defineMessages({
  loadAllMarketsMsg: {
    id: 'load.allMarkets',
    defaultMessage: 'loading',
  },
});

export default @withStyles(styles, { withTheme: true }) @injectIntl @observer @inject('store') class Markets extends Component {
  render() {
    const {
      classes: {
        dashboardCardTitle,
      },
      store: {
        marketStore,
      },
    } = this.props;

    return (
      <>
        <Card className={dashboardCardTitle}>
          <Typography color='textPrimary'>
            Markets
          </Typography>
        </Card>
        <Events marketStore={marketStore} />
      </>
    );
  }
}

const Events = observer(({ marketStore: { marketInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadAllMarketsMsg} />;
  const markets = (marketInfo || []).map((event, i) => <MarketView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    markets
  );
});
