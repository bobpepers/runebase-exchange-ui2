import { observable, action, runInAction, reaction } from 'mobx';
import { SortBy, Routes } from 'constants';


const INIT_VALUES = {
  loaded: false, // loading state?
  loadingMore: false, // for laoding icon?
  list: [], // data list
  hasMore: true, // has more data to fetch?
  skip: 0, // skip
  limit: 16, // loading batch amount
  sortBy: SortBy.DEFAULT,
};

export default class ExchangeStore {
  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable list = INIT_VALUES.list

  @observable hasMore = INIT_VALUES.hasMore

  @observable skip = INIT_VALUES.skip

  @observable sortBy = INIT_VALUES.sortBy

  limit = INIT_VALUES.limit

  constructor(app) {
    this.app = app;
    reaction(
      () => this.sortBy + this.app.wallet.addresses + this.app.global.syncBlockNum + this.app.refreshing.status,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.init();
        }
      }
    );
    reaction(
      () => this.list,
      () => {
        if (this.loaded && this.list.length < this.skip) this.hasMore = false;
      }
    );
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES);
    this.app.ui.location = Routes.EXCHANGE;
    await this.loadFirst();
  }

  @action
  loadFirst = async () => {
    this.list = await this.fetch(this.limit, 0);
    runInAction(() => {
      this.loaded = false;
    });
  }

  @action
  loadMore = async () => {
    if (this.hasMore) {
      this.loadingMore = true;
      this.skip += this.limit;
      const nextFewEvents = await this.fetch(this.limit, this.skip);
      runInAction(() => {
        this.list = [...this.list, ...nextFewEvents];
        this.loadingMore = false;
      });
    }
  }
}
