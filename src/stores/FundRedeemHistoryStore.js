import { observable, action, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllFundRedeems } from '../network/graphql/queries';
import FundRedeem from './models/FundRedeem';
import apolloClient from '../network/graphql';
import { getOnFundRedeemInfoSubscription } from '../network/graphql/subscriptions';
import { subtractPending, oppositePending } from '../helpers/utility';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  fundRedeemInfo: '',
  hasMoreFundRedeems: false, // has more buyOrders to fetch?
  hasLessFundRedeems: false, // has more buyOrders to fetch?
  skip: 0, // skip
  pendingDepositAmount: 0,
  pendingWithdrawAmount: 0,
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreFundRedeems = INIT_VALUES.hasMoreFundRedeems

  @observable hasLessFundRedeems = INIT_VALUES.hasLessFundRedeems

  @observable fundRedeemInfo = INIT_VALUES.fundRedeemInfo

  @observable pendingDepositAmount = INIT_VALUES.pendingDepositAmount

  @observable pendingWithdrawAmount = INIT_VALUES.pendingWithdrawAmount

  @computed get hasMore() {
    return this.hasMoreFundRedeems;
  }

  @computed get hasLess() {
    return this.hasLessFundRedeems;
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
    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing + this.app.global.syncBlockNum,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.getPendingInfo();
        }
      }
    );
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    await this.getFundRedeemInfo();
    this.loading = false;
  }

  getPendingInfo = async (limit = 500, skip = this.skip) => {
    if (this.subscription) {
      // this.subscription.unsubscribe();
    }
    try {
      if (this.app.wallet.currentAddressKey !== '') {
        const orderBy = { field: 'time', direction: 'DESC' };
        let pendingInfo = [];
        const filters = [{ owner: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address, status: 'PENDING' }];
        pendingInfo = await queryAllFundRedeems(filters, orderBy, limit, skip);
        this.onPendingInfo(pendingInfo);
        // this.subscribeFundRedeemInfo();
      }
    } catch (error) {
      this.onPendingInfo({ error });
    }
  }

  @action
  onPendingInfo = (pendingInfo) => {
    if (pendingInfo.error) {
      console.error(pendingInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(pendingInfo, 'txid').map((fundRedeem) => new FundRedeem(fundRedeem, this.app));
      const pendingDeposits = _.filter(result, { type: 'DEPOSITEXCHANGE' });
      const pendingWithdraws = _.filter(result, { type: 'WITHDRAWEXCHANGE' });
      const pendingDepositAmount = _(pendingDeposits).groupBy('token').map((amount, token) => ({ token, amount: _.sumBy(amount, 'amount') })).value();
      const pendingWithdrawAmount = _(pendingWithdraws).groupBy('token').map((amount, token) => ({ token, amount: _.sumBy(amount, 'amount') })).value();
      const pendingWithdrawAmountSubtract = subtractPending(pendingDepositAmount, pendingWithdrawAmount);
      const pendingDepositAmountSubtract = subtractPending(pendingWithdrawAmount, pendingDepositAmount);
      const mergableWithdraw = oppositePending(pendingDepositAmountSubtract);
      const mergableDeposit = oppositePending(pendingWithdrawAmountSubtract);
      this.pendingWithdrawAmount = _.assign({}, pendingWithdrawAmountSubtract, mergableWithdraw);
      this.pendingDepositAmount = _.assign({}, pendingDepositAmountSubtract, mergableDeposit);
    }
  }

  getFundRedeemInfo = async (limit = this.limit, skip = this.skip) => {
    this.loading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    try {
      if (this.app.wallet.currentAddressKey !== '') {
        const orderBy = { field: 'time', direction: 'DESC' };
        let fundRedeemInfo = [];
        const filters = [{ owner: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }];
        fundRedeemInfo = await queryAllFundRedeems(filters, orderBy, limit, skip);
        if (fundRedeemInfo.length < limit) this.hasMoreFundRedeems = false;
        if (fundRedeemInfo.length === limit) this.hasMoreFundRedeems = true;
        if (this.skip === 0) this.hasLessFundRedeems = false;
        if (this.skip > 0) this.hasLessFundRedeems = true;
        this.onFundRedeemInfo(fundRedeemInfo);
        this.subscribeFundRedeemInfo();
      }
    } catch (error) {
      this.onFundRedeemInfo({ error });
    }
  }

  @action
  onFundRedeemInfo = (fundRedeemInfo) => {
    if (fundRedeemInfo.error) {
      console.error(fundRedeemInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(fundRedeemInfo, 'txid').map((fundRedeem) => new FundRedeem(fundRedeem, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.fundRedeemInfo = resultOrder;
      this.loading = false;
    }
  }

  @action
  onFundRedeemInfoSub = (fundRedeemInfo) => {
    if (fundRedeemInfo.error) {
      console.error(fundRedeemInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.fundRedeemInfo === undefined) {
        this.fundRedeemInfo = [];
      }
      const result = _.uniqBy(fundRedeemInfo, 'txid').map((fundRedeem) => new FundRedeem(fundRedeem, this.app));
      result.forEach((fundRedeem) => {
        const index = _.findIndex(this.fundRedeemInfo, { txid: fundRedeem.txid });
        if (index === -1) {
          this.fundRedeemInfo.push(fundRedeem);
        } else {
          this.fundRedeemInfo[index] = fundRedeem;
        }
      });
      this.fundRedeemInfo = _.orderBy(this.fundRedeemInfo, ['time'], 'desc');
      this.fundRedeemInfo = this.fundRedeemInfo.slice(0, this.limit);
    }
  }

  subscribeFundRedeemInfo = () => {
    const self = this;
    if (this.app.wallet.currentAddressKey !== '') {
      this.subscription = apolloClient.subscribe({
        query: getOnFundRedeemInfoSubscription(this.app.wallet.addresses[this.app.wallet.currentAddressKey].address),
      }).subscribe({
        next({ data, errors }) {
          if (errors && errors.length > 0) {
            self.onFundRedeemInfoSub({ error: errors[0] });
          } else {
            const response = [];
            response.push(data.onFundRedeemInfo);
            self.onFundRedeemInfoSub(response);
          }
        },
        error(err) {
          self.onFundRedeemInfoSub({ error: err.message });
        },
      });
    }
  }
}
