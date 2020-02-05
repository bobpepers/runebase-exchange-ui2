import { observable, action, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import apolloClient from '../network/graphql';
import { getonFulfilledOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  fulfilledOrderInfo: '',
  hasMoreFulfilledOrders: false, // has more fulfilledOrders to fetch?
  hasLessFulfilledOrders: false, // has more fulfilledOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreFulfilledOrders = INIT_VALUES.hasMoreFulfilledOrders

  @observable hasLessFulfilledOrders = INIT_VALUES.hasLessFulfilledOrders

  @observable fulfilledOrderInfo = INIT_VALUES.fulfilledOrderInfo

  @computed get hasMore() {
    return this.hasMoreFulfilledOrders;
  }

  @computed get hasLess() {
    return this.hasLessFulfilledOrders;
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
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    await this.getFulfilledOrderInfo(limit, 0);
    this.loading = false;
  }

  getFulfilledOrderInfo = async (limit = this.limit, skip = this.skip) => {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.app.wallet.currentAddressSelected !== '') {
      const orderBy = { field: 'time', direction: this.app.sortBy };
      let fulfilledOrders = [];
      const filters = [{ owner: this.app.wallet.currentAddressSelected, status: 'FULFILLED' }];
      fulfilledOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
      if (fulfilledOrders.length < limit) this.hasMoreFulfilledOrders = false;
      if (fulfilledOrders.length === limit) this.hasMoreFulfilledOrders = true;
      if (this.skip === 0) this.hasLessFulfilledOrders = false;
      if (this.skip > 0) this.hasLessFulfilledOrders = true;
      this.onFulfilledOrderInfo(fulfilledOrders);
      this.subscribeFulfilledOrderInfo();
    }
  }

  @action
  onFulfilledOrderInfo = (fulfilledOrderInfo) => {
    if (fulfilledOrderInfo.error) {
      console.error(fulfilledOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(fulfilledOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.fulfilledOrderInfo = resultOrder;
      this.loading = false;
    }
  }

  @action
  onFulfilledOrderInfoSub = (fulfilledOrderInfo) => {
    if (this.fulfilledOrderInfo === undefined) {
      this.fulfilledOrderInfo = [];
    }
    if (fulfilledOrderInfo.error) {
      console.error(fulfilledOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      if (this.skip === 0 && fulfilledOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        const result = _.uniqBy(fulfilledOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
        result.forEach((order) => {
          const index = _.findIndex(this.fulfilledOrderInfo, { txid: order.txid });
          if (index === -1) {
            this.fulfilledOrderInfo.push(order);
          } else {
            this.fulfilledOrderInfo[index] = order;
          }
        });
        this.fulfilledOrderInfo = _.orderBy(this.fulfilledOrderInfo, ['time'], 'desc');
        this.fulfilledOrderInfo = this.fulfilledOrderInfo.slice(0, this.limit);
        this.app.activeOrderStore.getActiveOrderInfo();
      }
      if (this.skip !== 0 && fulfilledOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        this.getFulfilledOrderInfo();
        this.app.activeOrderStore.getActiveOrderInfo();
      }
      if (fulfilledOrderInfo[0].token === this.app.wallet.market) {
        this.app.sellStore.getSellOrderInfo();
        this.app.buyStore.getBuyOrderInfo();
      }
    }
  }

  subscribeFulfilledOrderInfo = () => {
    const self = this;
    this.subscription = apolloClient.subscribe({
      query: getonFulfilledOrderInfoSubscription('FULFILLED'),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onFulfilledOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onFulfilledOrderInfo);
          self.onFulfilledOrderInfoSub(response);
        }
      },
      error(err) {
        self.onFulfilledOrderInfoSub({ error: err.message });
      },
    });
  }
}
