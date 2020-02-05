import { observable, action, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import apolloClient from '../network/graphql';
import { getonBuyOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  list: [], // data list
  buyOrderInfo: '',
  hasMoreBuyOrders: true, // has more buyOrders to fetch?
  hasLessBuyOrders: true, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreBuyOrders = INIT_VALUES.hasMoreBuyOrders

  @observable hasLessBuyOrders = INIT_VALUES.hasLessBuyOrders

  @observable buyOrderInfo = INIT_VALUES.buyOrderInfo

  @computed get hasMore() {
    return this.hasMoreBuyOrders;
  }

  @computed get hasLess() {
    return this.hasLessBuyOrders;
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
        }
      }
    );
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    await this.getBuyOrderInfo(limit, 0);
    this.loading = false;
  }


  getBuyOrderInfo = async (limit = this.limit, skip = this.skip) => {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const orderBy = { field: 'price', direction: 'DESC' };
    let buyOrders = [];
    const filters = [
      { orderType: 'BUYORDER', token: this.app.wallet.market, status: 'ACTIVE' },
      { orderType: 'BUYORDER', token: this.app.wallet.market, status: 'PENDING' },
      { orderType: 'BUYORDER', token: this.app.wallet.market, status: 'PENDINGCANCEL' },
    ];
    buyOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
    if (buyOrders.length < limit) this.hasMoreBuyOrders = false;
    if (buyOrders.length === limit) this.hasMoreBuyOrders = true;
    if (this.skip === 0) this.hasLessBuyOrders = false;
    if (this.skip > 0) this.hasLessBuyOrders = true;
    this.onBuyOrderInfo(buyOrders);
    this.subscribeBuyOrderInfo();
  }

  @action
  onBuyOrderInfo = (buyOrderInfo) => {
    if (buyOrderInfo.error) {
      console.error(buyOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(buyOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['price'], 'desc');
      this.buyOrderInfo = resultOrder;
      this.loading = false;
    }
  }

  @action
  onBuyOrderInfoSub = (buyOrderInfo) => {
    if (buyOrderInfo.error) {
      console.error(buyOrderInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.buyOrderInfo === undefined) {
        this.buyOrderInfo = [];
      }
      const result = _.uniqBy(buyOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      result.forEach((trade) => {
        const index = _.findIndex(this.buyOrderInfo, { txid: trade.txid });
        if (index === -1) {
          this.buyOrderInfo.push(trade);
        } else {
          this.buyOrderInfo[index] = trade;
        }
      });
      this.buyOrderInfo = _.orderBy(this.buyOrderInfo, ['price'], 'desc');
      this.buyOrderInfo = this.buyOrderInfo.slice(0, this.limit);
    } else if (this.skip !== 0) {
      this.getBuyOrderInfo();
    }
  }

  subscribeBuyOrderInfo = () => {
    const self = this;
    this.subscription = apolloClient.subscribe({
      query: getonBuyOrderInfoSubscription('BUYORDER', this.app.wallet.market, 'ACTIVE'),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onBuyOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onBuyOrderInfo);
          self.onBuyOrderInfoSub(response);
        }
      },
      error(err) {
        self.onBuyOrderInfoSub({ error: err.message });
      },
    });
  }
}
