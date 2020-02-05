import { observable, action, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import Ohlc from './models/Ohlc';
import Volume from './models/Volume';
import apolloClient from '../network/graphql';
import { queryAllCharts } from '../network/graphql/queries';
import { getOnChartInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  ohlcInfo: null,
  volumeInfo: null,
  loading: true,
  timeTable: '1h',
  skip: 0,
};

export default class {
  @observable ohlcInfo = INIT_VALUES.ohlcInfo

  @observable volumeInfo = INIT_VALUES.volumeInfo

  @observable timeTable = INIT_VALUES.timeTable

  @observable skip = INIT_VALUES.skip

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.sortBy + this.app.refreshing,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.getChartInfo();
        }
      }
    );
    this.subscribeChartInfo();
  }

  @action
  changeTimeTable = (newTimeTable) => {
    this.timeTable = newTimeTable;
    this.getChartInfo();
  }

  @action
  getChartInfo = async (limit = 500, skip = 0) => {
    try {
      this.ohlcInfo = null;
      this.volumeInfo = null;
      const orderBy = { field: 'time', direction: 'ASC' };
      let chartInfo = [];
      const filters = [
        { timeTable: this.timeTable, tokenAddress: this.app.wallet.tokenAddress },
      ];
      chartInfo = await queryAllCharts(filters, orderBy, limit, skip);
      this.onChartInfo(chartInfo);
    } catch (error) {
      this.onChartInfo({ error });
    }
  }

  @action
  onChartInfo = (chartInfo) => {
    if (chartInfo.error) {
      console.error(chartInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(chartInfo, 'time').map((chart) => new Ohlc(chart, this.app));
      this.ohlcInfo = _.orderBy(result, ['time'], 'desc');
      const result2 = _.uniqBy(chartInfo, 'time').map((chart) => new Volume(chart, this.app));
      this.volumeInfo = _.orderBy(result2, ['time'], 'desc');
    }
  }

  @action
  onChartInfoSub = (myChartInfo) => {
    if (myChartInfo.error) {
      console.error(myChartInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.ohlcInfo === undefined) {
        this.ohlcInfo = [];
      }
      const ohlcResult = _.uniqBy(myChartInfo, 'time').map((chart) => new Ohlc(chart, this.app));
      const volumeResult = _.uniqBy(myChartInfo, 'time').map((chart) => new Volume(chart, this.app));
      ohlcResult.forEach((candle) => {
        const index = _.findIndex(this.ohlcInfo, { time: candle.time });
        if (index === -1) {
          this.ohlcInfo.push(candle);
        } else {
          this.ohlcInfo[index] = candle;
        }
      });
      this.ohlcInfo = _.orderBy(this.ohlcInfo, ['time'], 'desc');

      volumeResult.forEach((candle) => {
        const index = _.findIndex(this.volumeInfo, { time: candle.time });
        if (index === -1) {
          this.volumeInfo.push(candle);
        } else {
          this.volumeInfo[index] = candle;
        }
      });
      this.volumeInfo = _.orderBy(this.volumeInfo, ['time'], 'desc');
    } else if (this.skip !== 0) {
      this.getChartInfo();
    }
  }

  subscribeChartInfo = () => {
    const self = this;
    if (this.app.wallet.tokenAddress !== '') {
      this.subscription = apolloClient.subscribe({
        query: getOnChartInfoSubscription(this.timeTable, this.app.wallet.tokenAddress),
      }).subscribe({
        next({ data, errors }) {
          if (errors && errors.length > 0) {
            self.onChartInfoSub({ error: errors[0] });
          } else {
            const response = [];
            response.push(data.onChartInfo);
            self.onChartInfoSub(response);
          }
        },
        error(err) {
          self.onChartInfoSub({ error: err.message });
        },
      });
    }
  }
}
