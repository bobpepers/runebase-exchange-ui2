import { observable, action, runInAction, reaction } from 'mobx';
import _ from 'lodash';
import { queryAllMarkets, queryAllMarketImages } from '../network/graphql/queries';
import Market from './models/Market';


const INIT_VALUES = {
  loading: true,
  marketInfo: '', // INIT_VALUESial loaded state
  marketImages: '', // INIT_VALUESial loaded state
  skip: 0, // skip
  limit: 999,
};

export default class MarketStore {
  @observable marketInfo = INIT_VALUES.marketInfo

  @observable skip = INIT_VALUES.skip

  @observable limit = INIT_VALUES.limit

  @observable loading = INIT_VALUES.loading

  @observable marketImages = INIT_VALUES.marketImages

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.refreshing + this.app.global.syncBlockNum,
      () => {
        this.getMarketInfo();
      }
    );
    this.getMarketInfo();
    this.getMarketImages();
  }

  @action
  onMarketImages = (marketImages) => {
    if (marketImages.error) {
      console.error(marketImages.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(marketImages, 'market').map((market) => new Market(market, this.app));
      const resultOrder = _.orderBy(result, ['market'], 'desc');
      this.marketImages = resultOrder;
    }
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  getMarketImages = async () => {
    try {
      const orderBy = { field: 'market', direction: 'DESC' };
      const filters = [];
      const marketImages = await queryAllMarketImages(filters, orderBy, 0, 0);
      this.onMarketImages(marketImages);
    } catch (error) {
      this.onMarketImages({ error });
    }
  }

  @action
  onMarketInfo = (marketInfo) => {
    if (marketInfo.error) {
      console.error(marketInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(marketInfo, 'market').map((market) => new Market(market, this.app));
      const resultOrder = _.orderBy(result, ['market'], 'desc');
      this.marketInfo = resultOrder;
    }
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  getMarketInfo = async () => {
    try {
      const orderBy = { field: 'market', direction: 'DESC' };
      const filters = [];
      const marketInfo = await queryAllMarkets(filters, orderBy, 0, 0);
      this.onMarketInfo(marketInfo);
    } catch (error) {
      this.onMarketInfo({ error });
    }
  }
}
