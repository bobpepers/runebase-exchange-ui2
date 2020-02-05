import { observable, action, runInAction, reaction, computed } from 'mobx';
import _ from 'lodash';
import moment from 'moment';
import { TransactionType } from 'constants';
import { Transaction, TransactionCost } from 'models';
import { defineMessages } from 'react-intl';
import axios from '../network/api';
import Routes from '../network/routes';
import { createTransferTx, createTransferExchange, createRedeemExchange, createOrderExchange, createCancelOrderExchange, createExecuteOrderExchange } from '../network/graphql/mutations';
import { decimalToSatoshi } from '../helpers/utility';
import Tracking from '../helpers/mixpanelUtil';

// TODO: ADD ERROR TEXT FIELD FOR WITHDRAW DIALOGS, ALSO INTL TRANSLATION UPDATE
const messages = defineMessages({
  withdrawDialogInvalidAddressMsg: {
    id: 'withdrawDialog.invalidAddress',
    defaultMessage: 'Invalid address',
  },
  withdrawDialogAmountLargerThanZeroMsg: {
    id: 'withdrawDialog.amountLargerThanZero',
    defaultMessage: 'Amount should be larger than 0',
  },
  withdrawDialogAmountExceedLimitMsg: {
    id: 'withdrawDialog.amountExceedLimit',
    defaultMessage: 'Amount exceed the limit',
  },
  withdrawDialogRequiredMsg: {
    id: 'withdrawDialog.required',
    defaultMessage: 'Required',
  },
  depositDialogInvalidAddressMsg: {
    id: 'withdrawDialog.invalidAddress',
    defaultMessage: 'Invalid address',
  },
  depositDialogAmountLargerThanZeroMsg: {
    id: 'withdrawDialog.amountLargerThanZero',
    defaultMessage: 'Amount should be larger than 0',
  },
  depositDialogAmountExceedLimitMsg: {
    id: 'withdrawDialog.amountExceedLimit',
    defaultMessage: 'Amount exceed the limit',
  },
  depositDialogRequiredMsg: {
    id: 'withdrawDialog.required',
    defaultMessage: 'Required',
  },
});

const INIT_VALUE = {
  market: 'PRED',
  tokenAddress: 'cdaba40280c10b356e3b17fb8a023321cded71a7',
  txSentDialogOpen: false,
  exchangeAddress: 'RNLAUEZ7qmCVLYDbKYRhhj77KMoPUTgyGz', // Dummy Value
  accountData: [],
  addressesHasCoin: [],
  addressList: [],
  addresses: [],
  currentAddressSelected: '',
  currentAddressKey: '',
  lastUsedAddress: '',
  walletEncrypted: false,
  encryptResult: undefined,
  passphrase: '',
  walletUnlockedUntil: 0,
  unlockDialogOpen: false,
  changePassphraseResult: undefined,
  txConfirmDialogOpen: false,
  redeemConfirmDialogOpen: false,
  fundConfirmDialogOpen: false,
  cancelOrderConfirmDialogOpen: false,
  executeOrderConfirmDialogOpen: false,
  buyOrderConfirmDialogOpen: false,
  sellOrderConfirmDialogOpen: false,
  hasEnoughGasCoverage: false,
};

const INIT_VALUE_DIALOG = {
  selectedToken: 'RUNES',
  toAddress: '',
  withdrawAmount: '',
  withdrawDialogError: {
    withdrawAmount: '',
    walletAddress: '',
  },
};

export default class {
  @observable hasEnoughGasCoverage = INIT_VALUE.hasEnoughGasCoverage;

  @observable txSentDialogOpen = INIT_VALUE.txSentDialogOpen;

  @observable exchangeAddress = INIT_VALUE.exchangeAddress;

  @observable currentAddressSelected = INIT_VALUE.currentAddressSelected;

  @observable currentAddressKey = INIT_VALUE.currentAddressKey;

  @observable addressesHasCoin = INIT_VALUE.addressesHasCoin;

  @observable addressList = INIT_VALUE.addressList;

  @observable tokenAmount = INIT_VALUE.tokenAmount;

  @observable addresses = INIT_VALUE.addresses;

  @observable lastUsedAddress = INIT_VALUE.lastUsedAddress;

  @observable walletEncrypted = INIT_VALUE.walletEncrypted;

  @observable encryptResult = INIT_VALUE.encryptResult;

  @observable passphrase = INIT_VALUE.passphrase;

  @observable walletUnlockedUntil = INIT_VALUE.walletUnlockedUntil;

  @observable unlockDialogOpen = INIT_VALUE.unlockDialogOpen;

  @observable selectedToken = INIT_VALUE_DIALOG.selectedToken;

  @observable changePassphraseResult = INIT_VALUE.changePassphraseResult;

  @observable txConfirmDialogOpen = INIT_VALUE.txConfirmDialogOpen;

  @observable buyOrderConfirmDialogOpen = INIT_VALUE.buyOrderConfirmDialogOpen;

  @observable sellOrderConfirmDialogOpen = INIT_VALUE.sellOrderConfirmDialogOpen;

  @observable redeemConfirmDialogOpen = INIT_VALUE.redeemConfirmDialogOpen;

  @observable fundConfirmDialogOpen = INIT_VALUE.fundConfirmDialogOpen;

  @observable cancelOrderConfirmDialogOpen = INIT_VALUE.cancelOrderConfirmDialogOpen;

  @observable executeOrderConfirmDialogOpen = INIT_VALUE.executeOrderConfirmDialogOpen;

  @observable withdrawDialogError = INIT_VALUE_DIALOG.withdrawDialogError;

  @observable withdrawAmount = INIT_VALUE_DIALOG.withdrawAmount;

  @observable toAddress = INIT_VALUE_DIALOG.toAddress;

  @observable market = INIT_VALUE.market; // this.app.marketStore.marketInfo[0].market; Get this value from marketStore?

  @observable tokenAddress = INIT_VALUE.tokenAddress;

  constructor(app) {
    this.app = app;
    //
    // Set a default lastUsedAddress if there was none selected before
    reaction(
      () => this.addresses,
      () => {
        if (_.isEmpty(this.lastUsedAddress) && !_.isEmpty(this.addresses)) {
          this.lastUsedAddress = this.addresses[0].address;
        }
      }
    );
  }

  @action currentTokenDecimals = async (tokenChoice) => {
    if (tokenChoice === 'RUNES') {
      this.decimals = 8;
    } else {
      this.decimals = (_.find(this.app.marketStore.marketInfo, { market: tokenChoice })).decimals;
    }
    return this.decimals;
  }

  @action
  closeTxDialog = async () => {
    try {
      runInAction(() => {
        this.txSentDialogOpen = false;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  prepareRedeemExchange = async (walletAddress, confirmAmount, tokenChoice) => {
    this.txid = null;
    this.walletAddress = walletAddress;
    this.toAddress = this.exchangeAddress;
    this.confirmAmount = confirmAmount;
    this.tokenChoice = tokenChoice;

    if (tokenChoice === 'RUNES') {
      this.decimals = 8;
    } else {
      this.decimals = (_.find(this.app.marketStore.marketInfo, { market: tokenChoice })).decimals;
    }
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.WITHDRAWEXCHANGE,
        token: tokenChoice,
        amount: tokenChoice === this.app.baseCurrencyStore.baseCurrency.pair ? Number(confirmAmount) : decimalToSatoshi(confirmAmount, this.decimals),
        senderAddress: walletAddress,
        receiverAddress: this.toAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.redeemConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  confirmRedeemExchange = (onRedeem) => {
    this.createTransferRedeemExchange(this.walletAddress, this.exchangeAddress, this.tokenChoice, decimalToSatoshi(this.confirmAmount, this.decimals));
    runInAction(() => {
      onRedeem();
      this.redeemConfirmDialogOpen = false;
      Tracking.track('myWallet-withdraw');
    });
  };

  @action
  createTransferRedeemExchange = async (walletAddress, toAddress, selectedToken, amount) => {
    try {
      const { data: { redeemExchange } } = await createRedeemExchange(walletAddress, toAddress, selectedToken, amount);
      this.app.myWallet.history.addTransaction(new Transaction(redeemExchange));
      runInAction(() => {
        this.txid = redeemExchange.txid;
        this.txSentDialogOpen = true;
        this.app.pendingTxsSnackbar.init();
        this.app.fundRedeemHistoryStore.getPendingInfo();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action changeMarket = (market, tokenAddress, addresses) => {
    if (market === this.market) {
      return;
    }
    this.addressList = [];
    this.market = market;
    this.tokenAddress = tokenAddress;
    addresses.forEach((address) => {
      if (address[market] || address[this.app.baseCurrencyStore.baseCurrency.pair]) {
        this.accountData = [address.address, market, address[market], address[this.app.baseCurrencyStore.baseCurrency.pair]];
        this.addressList.push(this.accountData);
      }
    });
    try {
      runInAction(() => {
        this.app.priceChartStore.getChartInfo();
        this.app.buyStore.getBuyOrderInfo();
        this.app.sellStore.getSellOrderInfo();
        this.app.buyHistoryStore.getBuyHistoryInfo();
        this.app.sellHistoryStore.getSellHistoryInfo();
        this.app.marketStore.getMarketInfo();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action changeAddress = (key, event) => {
    this.currentAddressKey = key;
    if (event.currentTarget.attributes.getNamedItem('address').value != null) {
      this.currentAddressSelected = event.currentTarget.attributes.getNamedItem('address').value;
    }
    try {
      runInAction(() => {
        this.app.fundRedeemHistoryStore.getFundRedeemInfo();
        this.app.fundRedeemHistoryStore.getPendingInfo();
        this.app.buyStore.getBuyOrderInfo();
        this.app.sellStore.getSellOrderInfo();
        this.app.activeOrderStore.getActiveOrderInfo();
        this.app.fulfilledOrderStore.getFulfilledOrderInfo();
        this.app.canceledOrderStore.getCanceledOrderInfo();
        this.app.myTradeStore.getMyTradeInfo();
        this.app.marketStore.getMarketInfo();
        this.app.buyHistoryStore.getBuyHistoryInfo();
        this.app.sellHistoryStore.getSellHistoryInfo();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  closeOrderExchange = async () => {
    try {
      runInAction(() => {
        this.orderConfirmDialogOpen = false;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  prepareBuyOrderExchange = async (price, confirmAmount, tokenChoice, orderType, total) => {
    this.txid = null;
    this.walletAddress = this.currentAddressSelected;
    this.toAddress = this.exchangeAddress;
    this.confirmAmount = confirmAmount;
    this.tokenChoice = tokenChoice;
    this.orderType = orderType;
    this.price = price;
    this.orderTotal = total;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.BUYORDER,
        token: tokenChoice,
        amount: tokenChoice === this.app.baseCurrencyStore.baseCurrency.pair ? Number(confirmAmount) : decimalToSatoshi(confirmAmount, 8),
        senderAddress: this.walletAddress,
        receiverAddress: this.toAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.buyOrderConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.orderTotal = 0;
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  prepareSellOrderExchange = async (price, confirmAmount, tokenChoice, orderType, total) => {
    this.txid = null;
    this.walletAddress = this.currentAddressSelected;
    this.toAddress = this.exchangeAddress;
    this.confirmAmount = confirmAmount;
    this.tokenChoice = tokenChoice;
    this.orderType = orderType;
    this.price = price;
    this.orderTotal = total;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.SELLORDER,
        token: tokenChoice,
        amount: tokenChoice === this.app.baseCurrencyStore.baseCurrency.pair ? Number(confirmAmount) : decimalToSatoshi(confirmAmount, 8),
        senderAddress: this.walletAddress,
        receiverAddress: this.toAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.sellOrderConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.orderTotal = 0;
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  confirmOrderExchange = (onOrder) => {
    let amount = this.confirmAmount;
    amount = decimalToSatoshi(this.confirmAmount, 8);
    this.createTransferOrderExchange(this.walletAddress, this.exchangeAddress, this.tokenChoice, amount, this.price, this.orderType);
    runInAction(() => {
      onOrder();
      this.buyOrderConfirmDialogOpen = false;
      this.sellOrderConfirmDialogOpen = false;
      Tracking.track('myWallet-withdraw');
    });
  };

  @action
  createTransferOrderExchange = async (walletAddress, toAddress, selectedToken, amount, price, orderType) => {
    try {
      const { data: { orderExchange } } = await createOrderExchange(walletAddress, toAddress, selectedToken, amount, price, orderType);
      this.app.myWallet.history.addTransaction(new Transaction(orderExchange));
      runInAction(() => {
        this.txid = orderExchange.txid;
        this.txSentDialogOpen = true;
        this.app.pendingTxsSnackbar.init();
        this.app.activeOrderStore.getActiveOrderInfo();
        this.orderTotal = 0;
      });
    } catch (error) {
      runInAction(() => {
        this.orderTotal = 0;
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  prepareCancelOrderExchange = async (orderId) => {
    this.txid = null;
    this.walletAddress = this.currentAddressSelected;
    this.toAddress = this.exchangeAddress;
    this.orderId = orderId;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.CANCELORDER,
        token: this.app.baseCurrencyStore.baseCurrency.pair,
        amount: 1,
        senderAddress: this.walletAddress,
        receiverAddress: this.toAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.cancelOrderConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  confirmCancelOrderExchange = (onCancelOrder) => {
    this.createTransferCancelOrderExchange(this.walletAddress, this.orderId);
    runInAction(() => {
      onCancelOrder();
      this.cancelOrderConfirmDialogOpen = false;
      Tracking.track('myWallet-withdraw');
    });
  };

  @action
  createTransferCancelOrderExchange = async (walletAddress, orderId) => {
    try {
      const { data: { cancelOrderExchange } } = await createCancelOrderExchange(walletAddress, orderId);
      this.app.myWallet.history.addTransaction(new Transaction(cancelOrderExchange));
      runInAction(() => {
        this.txid = cancelOrderExchange.txid;
        this.txSentDialogOpen = true;
        this.app.pendingTxsSnackbar.init();
        this.app.activeOrderStore.getActiveOrderInfo();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  prepareExecuteOrderExchange = async (orderId, exchangeAmount) => {
    this.txid = null;
    this.walletAddress = this.currentAddressSelected;
    this.toAddress = this.exchangeAddress;
    this.orderId = orderId;
    this.exchangeAmount = exchangeAmount;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.EXECUTEORDER,
        token: this.app.baseCurrencyStore.baseCurrency.pair,
        amount: 1,
        senderAddress: this.walletAddress,
        receiverAddress: this.toAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.executeOrderConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  confirmExecuteOrderExchange = (onExecuteOrder) => {
    this.createTransferExecuteOrderExchange(this.walletAddress, this.orderId, this.exchangeAmount);
    runInAction(() => {
      onExecuteOrder();
      this.executeOrderConfirmDialogOpen = false;
      Tracking.track('myWallet-withdraw');
    });
  };

  @action
  createTransferExecuteOrderExchange = async (walletAddress, orderId, exchangeAmount) => {
    try {
      const { data: { executeOrderExchange } } = await createExecuteOrderExchange(walletAddress, orderId, exchangeAmount);
      this.app.myWallet.history.addTransaction(new Transaction(executeOrderExchange));
      runInAction(() => {
        this.txid = executeOrderExchange.txid;
        this.txSentDialogOpen = true;
        this.app.pendingTxsSnackbar.init();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  prepareDepositExchange = async (walletAddress, confirmAmount, tokenChoice) => {
    this.txid = null;
    this.walletAddress = walletAddress;
    this.toAddress = this.exchangeAddress;
    this.confirmAmount = confirmAmount;
    this.tokenChoice = tokenChoice;
    if (tokenChoice === 'RUNES') {
      this.decimals = 8;
    } else {
      this.decimals = (_.find(this.app.marketStore.marketInfo, { market: tokenChoice })).decimals;
    }

    const calc = (this.addresses[this.currentAddressKey][this.app.baseCurrencyStore.baseCurrency.pair] - confirmAmount);

    if (tokenChoice === this.app.baseCurrencyStore.baseCurrency.pair && calc < 2) {
      this.hasEnoughGasCoverage = true;
    } else if (tokenChoice !== this.app.baseCurrencyStore.baseCurrency.pair && this.addresses[this.currentAddressKey][this.app.baseCurrencyStore.baseCurrency.pair] < 2) {
      this.hasEnoughGasCoverage = true;
    } else {
      try {
        const { data: { result } } = await axios.post(Routes.api.transactionCost, {
          type: TransactionType.DEPOSITEXCHANGE,
          token: tokenChoice,
          amount: tokenChoice === this.app.baseCurrencyStore.baseCurrency.pair ? Number(confirmAmount) : decimalToSatoshi(confirmAmount, this.decimals),
          senderAddress: walletAddress,
          receiverAddress: this.toAddress,
        });
        const txFees = _.map(result, (item) => new TransactionCost(item, this.app.baseCurrencyStore.baseCurrency.pair));
        runInAction(() => {
          this.txFees = txFees;
          this.fundConfirmDialogOpen = true;
        });
      } catch (error) {
        runInAction(() => {
          this.app.ui.setError(error.message, Routes.api.transactionCost);
        });
      }
    }
  }

  @action
  confirmFundExchange = (onDeposit) => {
    let amount = this.confirmAmount;
    console.log(this.decimals);
    Object.keys(this.app.marketStore.marketInfo).forEach((key) => {
      if (this.tokenChoice === this.app.marketStore.marketInfo[key].market) {
        amount = decimalToSatoshi(this.confirmAmount, this.decimals);
      }
    });

    this.createTransferTransactionExchange(this.walletAddress, this.exchangeAddress, this.tokenChoice, amount);
    runInAction(() => {
      onDeposit();
      this.fundConfirmDialogOpen = false;
      Tracking.track('myWallet-deposit');
    });
  };

  @action
  createTransferTransactionExchange = async (walletAddress, toAddress, selectedToken, amount) => {
    try {
      const { data: { transferExchange } } = await createTransferExchange(walletAddress, toAddress, selectedToken, amount);
      this.app.myWallet.history.addTransaction(new Transaction(transferExchange));
      runInAction(() => {
        this.txid = transferExchange.txid;
        this.txSentDialogOpen = true;
        this.app.pendingTxsSnackbar.init();
        this.app.fundRedeemHistoryStore.getPendingInfo();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @computed get currentAddressSelecteds() {
    return this.currentAddressSelected;
  }

  @computed get currentAddresses() {
    return this.addressList;
  }

  @computed get currentMarket() {
    return this.market;
  }

  @computed get currentTokenAmount() {
    return this.tokenAmount;
  }

  @computed get needsToBeUnlocked() {
    if (this.walletEncrypted) return false;
    if (this.walletUnlockedUntil === 0) return true;
    const now = moment();
    const unlocked = moment.unix(this.walletUnlockedUntil).subtract(1, 'hours');
    return now.isSameOrAfter(unlocked);
  }

  @computed get withdrawDialogHasError() {
    if (this.withdrawDialogError.withdrawAmount !== '') return true;
    if (this.withdrawDialogError.walletAddress !== '') return true;
    return false;
  }

  @computed get lastAddressWithdrawLimit() {
    const WithdrawLimit = {};
    Object.keys(this.lastUsedWallet.Wallet).forEach((key) => {
      WithdrawLimit[key] = this.lastUsedWallet.Wallet[key];
    });
    return WithdrawLimit;
  }

  @computed get depsoitDialogHasError() {
    if (this.withdrawDialogError.withdrawAmount !== '') return true;
    if (this.withdrawDialogError.walletAddress !== '') return true;
    return false;
  }

  @computed get lastAddressDepositLimit() {
    const DepositLimit = {};
    Object.keys(this.lastUsedWallet.Wallet).forEach((key) => {
      DepositLimit[key] = this.lastUsedWallet.Wallet[key];
    });
    return DepositLimit;
  }

  @computed get lastUsedWallet() {
    const res = _.filter(this.addresses, (x) => x.address === this.lastUsedAddress);
    if (res.length > 0) return res[0];
    return {};
  }

  @action
  checkWalletEncrypted = async () => {
    try {
      const { data: { result } } = await axios.get(Routes.api.getWalletInfo);

      runInAction(() => {
        this.walletEncrypted = result && !_.isUndefined(result.unlocked_until);
        this.walletUnlockedUntil = result && result.unlocked_until ? result.unlocked_until : 0;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.getWalletInfo);
      });
    }
  }

  @action
  encryptWallet = async (passphrase) => {
    try {
      const { data: { result } } = await axios.post(Routes.api.encryptWallet, {
        passphrase,
      });
      this.encryptResult = result;
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.encryptWallet);
      });
    }
  }

  @action
  onPassphraseChange = (passphrase) => {
    this.passphrase = passphrase;
  }

  @action
  clearEncryptResult = () => {
    this.encryptResult = undefined;
  }

  isValidAddress = async (addressToVerify) => {
    try {
      const { data: { result } } = await axios.post(Routes.api.validateAddress, { address: addressToVerify });
      return result.isvalid;
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.validateAddress);
      });
    }
  }

  @action
  validateWithdrawDialogWalletAddress = async () => {
    if (_.isEmpty(this.toAddress)) {
      this.withdrawDialogError.walletAddress = messages.withdrawDialogRequiredMsg.id;
    } else if (!(await this.isValidAddress(this.toAddress))) {
      this.withdrawDialogError.walletAddress = messages.withdrawDialogInvalidAddressMsg.id;
    } else {
      this.withdrawDialogError.walletAddress = '';
    }
  }

  @action
  validateWithdrawDialogAmount = () => {
    if (_.isEmpty(this.withdrawAmount)) {
      this.withdrawDialogError.withdrawAmount = messages.withdrawDialogRequiredMsg.id;
    } else if (Number(this.withdrawAmount) <= 0) {
      this.withdrawDialogError.withdrawAmount = messages.withdrawDialogAmountLargerThanZeroMsg.id;
    } else if (Number(this.withdrawAmount) > this.lastAddressWithdrawLimit[this.selectedToken]) {
      this.withdrawDialogError.withdrawAmount = messages.withdrawDialogAmountExceedLimitMsg.id;
    } else {
      this.withdrawDialogError.withdrawAmount = '';
    }
  }

  @action
  resetWithdrawDialog = () => Object.assign(this, INIT_VALUE_DIALOG);

  @action
  resetDepositDialog = () => Object.assign(this, INIT_VALUE_DIALOG);

  @action
  backupWallet = async () => {
    try {
      await axios.post(Routes.api.backupWallet);
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.backupWallet);
      });
    }
  }

  @action
  confirm = (onWithdraw) => {
    let amount = this.withdrawAmount;
    Object.keys(this.app.marketStore.marketInfo).forEach((key) => {
      if (this.selectedToken === this.app.marketStore.marketInfo[key].market) {
        amount = decimalToSatoshi(this.withdrawAmount, 8);
      }
    });

    this.createTransferTransaction(this.walletAddress, this.toAddress, this.selectedToken, amount);
    runInAction(() => {
      onWithdraw();
      this.txConfirmDialogOpen = false;
      Tracking.track('myWallet-withdraw');
    });
  };

  @action
  prepareWithdraw = async (walletAddress) => {
    this.walletAddress = walletAddress;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.WITHDRAWEXCHANGE,
        token: this.selectedToken,
        amount: this.selectedToken === this.app.baseCurrencyStore.baseCurrency.pair ? Number(this.withdrawAmount) : decimalToSatoshi(this.withdrawAmount, 8),
        optionIdx: undefined,
        senderAddress: walletAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.txConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  prepareDeposit = async (walletAddress) => {
    this.walletAddress = walletAddress;
    try {
      const { data: { result } } = await axios.post(Routes.api.transactionCost, {
        type: TransactionType.TRANSFER,
        token: this.selectedToken,
        amount: this.selectedToken === this.app.baseCurrencyStore.baseCurrency.pair ? Number(this.depositAmount) : decimalToSatoshi(this.depositAmount, 8),
        optionIdx: undefined,
        senderAddress: walletAddress,
      });
      const txFees = _.map(result, (item) => new TransactionCost(item));
      runInAction(() => {
        this.txFees = txFees;
        this.txConfirmDialogOpen = true;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.transactionCost);
      });
    }
  }

  @action
  createTransferTransaction = async (walletAddress, toAddress, selectedToken, amount) => {
    try {
      const { data: { transfer } } = await createTransferTx(walletAddress, toAddress, selectedToken, amount);
      this.app.myWallet.history.addTransaction(new Transaction(transfer));
      runInAction(() => {
        this.app.pendingTxsSnackbar.init();
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.createTransferTx);
      });
    }
  }

  @action
  changePassphrase = async (oldPassphrase, newPassphrase) => {
    try {
      const changePassphraseResult = await axios.post(Routes.api.walletPassphraseChange, {
        oldPassphrase,
        newPassphrase,
      });
      runInAction(() => {
        this.changePassphraseResult = changePassphraseResult;
      });
    } catch (error) {
      runInAction(() => {
        this.app.ui.setError(error.message, Routes.api.walletPassphraseChange);
      });
    }
  }
}
