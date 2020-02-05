import { observable, action, runInAction } from 'mobx';
import { queryBaseCurrency } from '../network/graphql/queries';


const INIT_VALUES = {
  loading: true,
  baseCurrency: '', // INIT_VALUESial loaded state
  skip: 0, // skip
  limit: 999,
};

export default class BaseCurrencyStore {
  @observable baseCurrency = INIT_VALUES.baseCurrency

  @observable skip = INIT_VALUES.skip

  @observable limit = INIT_VALUES.limit

  @observable loading = INIT_VALUES.loading

  constructor(app) {
    this.app = app;
    this.getBaseCurrency();
  }

  @action
  onBaseCurrency = (baseCurrency) => {
    if (baseCurrency.error) {
      console.error(baseCurrency.error.message); // eslint-disable-line no-console
    } else {
      const [currencyBase] = baseCurrency;
      this.baseCurrency = currencyBase;
    }
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  getBaseCurrency = async () => {
    try {
      const orderBy = {};
      const filters = [];
      const baseCurrency = await queryBaseCurrency(filters, orderBy, 0, 0);
      this.onBaseCurrency(baseCurrency);
    } catch (error) {
      this.onBaseCurrency({ error });
    }
  }
}
