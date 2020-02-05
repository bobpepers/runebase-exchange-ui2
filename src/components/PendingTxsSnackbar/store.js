import { observable, action, reaction, runInAction } from 'mobx';
import _ from 'lodash';
import { TransactionType, TransactionStatus } from 'constants';
import { Transaction, NewOrder, Trade, FundRedeem } from 'models';

import { queryAllTransactions, queryAllNewOrders, queryAllTrades, queryAllFundRedeems } from '../../network/graphql/queries';


const INIT_VALUES = {
  isVisible: false,
  count: 0,
  pendingTransfers: 0,
  pendingBuyOrders: 0,
  pendingSellOrders: 0,
  pendingCancelOrders: 0,
  pendingExecuteOrders: 0,
  pendingWithdrawExchanges: 0,
  pendingDepositExchanges: 0,
};

export default class PendingTxsSnackbarStore {
  @observable isVisible = INIT_VALUES.isVisible

  @observable count = INIT_VALUES.count

  pendingTransfers = INIT_VALUES.pendingTransfers

  pendingBuyOrders = INIT_VALUES.pendingBuyOrders

  pendingSellOrders = INIT_VALUES.pendingSellOrders

  pendingCancelOrders = INIT_VALUES.pendingCancelOrders

  pendingExecuteOrders = INIT_VALUES.pendingExecuteOrders

  pendingWithdrawExchanges = INIT_VALUES.pendingWithdrawExchanges

  pendingDepositExchanges = INIT_VALUES.pendingDepositExchanges

  constructor(app) {
    this.app = app;

    // Hide/show the snackbar when the pending count changes
    reaction(
      () => this.count,
      () => this.isVisible = this.count > 0
    );
    // Query pending txs on new blocks
    reaction(
      () => this.app.global.syncBlockNum,
      () => {
        if (this.app.global.syncPercent >= 100) {
          this.queryPendingTransactions();
        }
      },
    );

    this.init();
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES);
    await this.queryPendingTransactions();
  }

  @action
  queryPendingTransactions = async () => {
    try {
      const filters = [{ status: TransactionStatus.PENDING }];
      const filtersCancel = [{ status: 'PENDINGCANCEL' }];
      const resultCancelOrders = await queryAllNewOrders(filtersCancel);
      const result = await queryAllTransactions(filters);
      const resultOrders = await queryAllNewOrders(filters);
      const resultTrades = await queryAllTrades(filters);
      const resultFundRedeems = await queryAllFundRedeems(filters);

      const txs = _.map(result, (tx) => new Transaction(tx));
      const orders = _.map(resultOrders, (order) => new NewOrder(order));
      const cancelOrders = _.map(resultCancelOrders, (cancelOrder) => new NewOrder(cancelOrder));
      const trades = _.map(resultTrades, (trade) => new Trade(trade));
      const fundRedeems = _.map(resultFundRedeems, (fundRedeem) => new FundRedeem(fundRedeem));


      runInAction(() => {
        this.count = txs.length + orders.length + trades.length + fundRedeems.length + cancelOrders.length;
        this.pendingTransfers = _.filter(txs, { type: TransactionType.TRANSFER });
        this.pendingBuyOrders = _.filter(orders, { type: TransactionType.BUYORDER });
        this.pendingSellOrders = _.filter(orders, { type: TransactionType.SELLORDER });
        this.pendingCancelOrders = _.filter(cancelOrders, { type: TransactionType.CANCELORDER });
        this.pendingExecuteOrders = _.filter(trades, { type: TransactionType.EXECUTEORDER });
        this.pendingWithdrawExchanges = _.filter(fundRedeems, { type: TransactionType.WITHDRAWEXCHANGE });
        this.pendingDepositExchanges = _.filter(fundRedeems, { type: TransactionType.DEPOSITEXCHANGE });
      });
    } catch (error) {
      console.error(error); // eslint-disable-line

      runInAction(() => {
        Object.assign(this, INIT_VALUES);
      });
    }
  }

  reset = () => Object.assign(this, INIT_VALUES)
}
