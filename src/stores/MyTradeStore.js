import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllTrades } from '../network/graphql/queries';
import Trade from './models/Trade';
import apolloClient from '../network/graphql';
import { getOnMyTradeInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  myTradeInfo: [],
  hasMoreMyTrades: false, // has more buyOrders to fetch?
  hasLessMyTrades: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreMyTrades = INIT_VALUES.hasMoreMyTrades

  @observable hasLessMyTrades = INIT_VALUES.hasLessMyTrades

  @observable myTradeInfo = INIT_VALUES.myTradeInfo

  @computed get hasMore() {
    return this.hasMoreMyTrades;
  }

  @computed get hasLess() {
    return this.hasLessMyTrades;
  }

  @observable skip = INIT_VALUES.skip

  limit = 10

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.init();
        }
      }
    );
    this.subscribeMyTradeInfo();
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    runInAction(() => {
      this.loading = false;
    });
  }

  getMyTradeInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    try {
      if (this.app.wallet.currentAddressKey !== '') {
        const orderBy = { field: 'time', direction: 'DESC' };
        let myTradeInfo = [];
        const filters = [{ from: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }, { to: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }]; /* Filter From and To,  unique by txid */
        myTradeInfo = await queryAllTrades(filters, orderBy, limit, skip);
        if (myTradeInfo.length < limit) this.hasMoreMyTrades = false;
        if (myTradeInfo.length === limit) this.hasMoreMyTrades = true;
        if (this.skip === 0) this.hasLessMyTrades = false;
        if (this.skip > 0) this.hasLessMyTrades = true;
        this.onMyTradeInfo(myTradeInfo);

        this.subscribeMyTradeInfo();
      }
    } catch (error) {
      this.onMyTradeInfo({ error });
    }
  }

  @action
  onMyTradeInfo = (myTradeInfo) => {
    if (myTradeInfo.error) {
      console.error(myTradeInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(myTradeInfo, 'txid').map((trade) => new Trade(trade, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.myTradeInfo = resultOrder;
    }
  }

  @action
  onMyTradeInfoSub = (myTradeInfo) => {
    if (myTradeInfo.error) {
      console.error(myTradeInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.myTradeInfo === undefined) {
        this.myTradeInfo = [];
      }
      const result = _.uniqBy(myTradeInfo, 'txid').map((trade) => new Trade(trade, this.app));
      result.forEach((trade) => {
        const index = _.findIndex(this.myTradeInfo, { txid: trade.txid });
        if (index === -1) {
          this.myTradeInfo.push(trade);
        } else {
          this.myTradeInfo[index] = trade;
        }
      });
      this.myTradeInfo = _.orderBy(this.myTradeInfo, ['time'], 'desc');
      this.myTradeInfo = this.myTradeInfo.slice(0, this.limit);
    } else if (this.skip !== 0) {
      this.getMyTradeInfo();
    }
  }

  subscribeMyTradeInfo = () => {
    const self = this;
    if (this.app.wallet.currentAddressKey !== '') {
      this.subscription = apolloClient.subscribe({
        query: getOnMyTradeInfoSubscription(this.app.wallet.addresses[this.app.wallet.currentAddressKey].address),
      }).subscribe({
        next({ data, errors }) {
          if (errors && errors.length > 0) {
            self.onMyTradeInfoSub({ error: errors[0] });
          } else {
            const response = [];
            response.push(data.onMyTradeInfo);
            self.onMyTradeInfoSub(response);
          }
        },
        error(err) {
          self.onMyTradeInfoSub({ error: err.message });
        },
      });
    }
  }
}
