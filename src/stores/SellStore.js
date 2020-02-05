import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import apolloClient from '../network/graphql';
import { getonSellOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  sellOrderInfo: '',
  hasMoreSellOrders: true, // has more sellOrders to fetch?
  hasLessSellOrders: true, // has more sellOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreSellOrders = INIT_VALUES.hasMoreSellOrders

  @observable hasLessSellOrders = INIT_VALUES.hasLessSellOrders

  @observable sellOrderInfo = INIT_VALUES.sellOrderInfo

  @computed get hasMore() {
    return this.hasMoreSellOrders;
  }

  @computed get hasLess() {
    return this.hasLessSellOrders;
  }

  @observable skip = INIT_VALUES.skip

  limit = 5

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.init();
          this.getSellOrderInfo();
        }
      }
    );
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    await this.getSellOrderInfo(limit, 0);
    this.loading = false;
  }

  @action
  getSellOrderInfo = async (limit = this.limit, skip = this.skip) => {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const orderBy = { field: 'price', direction: 'ASC' };
    let sellOrders = [];
    const filters = [
      { orderType: 'SELLORDER', token: this.app.wallet.market, status: 'PENDING' },
      { orderType: 'SELLORDER', token: this.app.wallet.market, status: 'PENDINGCANCEL' },
      { orderType: 'SELLORDER', token: this.app.wallet.market, status: 'ACTIVE' },
    ];
    sellOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
    this.onSellOrderInfo(sellOrders);
    this.subscribeSellOrderInfo();
    runInAction(() => {
      if (sellOrders.length < limit) this.hasMoreSellOrders = false;
      if (sellOrders.length === limit) this.hasMoreSellOrders = true;
      if (this.skip === 0) this.hasLessSellOrders = false;
      if (this.skip > 0) this.hasLessSellOrders = true;
    });
  }

  @action
  onSellOrderInfo = (sellOrderInfo) => {
    if (sellOrderInfo.error) {
      console.error(sellOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(sellOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      this.sellOrderInfo = _.orderBy(result, ['price'], 'asc');
      this.loading = false;
    }
  }

  @action
  onSellOrderInfoSub = (sellOrderInfo) => {
    if (sellOrderInfo.error) {
      console.error(sellOrderInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.sellOrderInfo === undefined) {
        this.sellOrderInfo = [];
      }
      const result = _.uniqBy(sellOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      result.forEach((order) => {
        const index = _.findIndex(this.sellOrderInfo, { txid: order.orderId });
        if (index === -1) {
          this.sellOrderInfo.push(order);
        } else {
          this.sellOrderInfo[index] = order;
        }
      });
      this.sellOrderInfo = _.orderBy(this.sellOrderInfo, ['price'], 'desc');
      this.sellOrderInfo = this.sellOrderInfo.slice(0, this.limit);
    } else if (this.skip !== 0) {
      this.getSellOrderInfo();
    }
  }

  subscribeSellOrderInfo = () => {
    const self = this;
    this.subscription = apolloClient.subscribe({
      query: getonSellOrderInfoSubscription('SELLORDER', this.app.wallet.market, 'ACTIVE'),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onSellOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onSellOrderInfo);
          self.onSellOrderInfoSub(response);
        }
      },
      error(err) {
        self.onSellOrderInfoSub({ error: err.message });
      },
    });
  }
}
