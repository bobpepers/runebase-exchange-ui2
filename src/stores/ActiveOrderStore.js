import { observable, action, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import apolloClient from '../network/graphql';
import { getonActiveOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  activeOrderInfo: '',
  hasMoreActiveOrders: false, // has more activeOrders to fetch?
  hasLessActiveOrders: false, // has more activeOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreActiveOrders = INIT_VALUES.hasMoreActiveOrders

  @observable hasLessActiveOrders = INIT_VALUES.hasLessActiveOrders

  @observable activeOrderInfo = INIT_VALUES.activeOrderInfo

  @computed get hasMore() {
    return this.hasMoreActiveOrders;
  }

  @computed get hasLess() {
    return this.hasLessActiveOrders;
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

    if (this.app.wallet.currentAddressSelected === '') {
      this.hasLessActiveOrders = false;
      this.hasMoreActiveOrders = false;
    }
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    await this.getActiveOrderInfo(limit, 0);
    this.loading = false;
  }

  @action
  getActiveOrderInfo = async (limit = this.limit, skip = this.skip) => {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.app.wallet.currentAddressSelected !== '') {
      const orderBy = { field: 'time', direction: this.app.sortBy };
      let activeOrders = [];
      const filters = [
        { owner: this.app.wallet.currentAddressSelected, status: 'ACTIVE' },
        { owner: this.app.wallet.currentAddressSelected, status: 'PENDING' },
        { owner: this.app.wallet.currentAddressSelected, status: 'PENDINGCANCEL' },
      ];
      activeOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
      if (activeOrders.length < limit) this.hasMoreActiveOrders = false;
      if (activeOrders.length === limit) this.hasMoreActiveOrders = true;
      if (this.skip === 0) this.hasLessActiveOrders = false;
      if (this.skip > 0) this.hasLessActiveOrders = true;
      this.onActiveOrderInfo(activeOrders);
      this.subscribeActiveOrderInfo();
      this.loading = false;
    }
  }

  @action
  onActiveOrderInfo = (activeOrderInfo) => {
    if (activeOrderInfo.error) {
      console.error(activeOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(activeOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.activeOrderInfo = resultOrder;
      this.loading = false;
    }
  }

  @action
  onActiveOrderInfoSub = (activeOrderInfo) => {
    if (this.activeOrderInfo === undefined) {
      this.activeOrderInfo = [];
    }
    if (activeOrderInfo.error) {
      console.error(activeOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      if (this.skip === 0 && activeOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        const result = _.uniqBy(activeOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
        result.forEach((trade) => {
          const index = _.findIndex(this.activeOrderInfo, { txid: trade.txid });
          if (index === -1) {
            this.activeOrderInfo.push(trade);
          } else {
            this.activeOrderInfo[index] = trade;
          }
        });
        this.activeOrderInfo = _.orderBy(this.activeOrderInfo, ['time'], 'desc');
        this.activeOrderInfo = this.activeOrderInfo.slice(0, this.limit);
      }
      if (this.skip !== 0 && activeOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        this.getActiveOrderInfo();
      }
      if (activeOrderInfo[0].token === this.app.wallet.market) {
        this.app.sellStore.getSellOrderInfo();
        this.app.buyStore.getBuyOrderInfo();
      }
    }
  }

  subscribeActiveOrderInfo = () => {
    const self = this;
    this.subscription = apolloClient.subscribe({
      query: getonActiveOrderInfoSubscription(),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onActiveOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onActiveOrderInfo);
          self.onActiveOrderInfoSub(response);
        }
      },
      error(err) {
        self.onActiveOrderInfoSub({ error: err.message });
      },
    });
  }
}
