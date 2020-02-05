import _ from 'lodash';

class GraphParser {
  static getParser(requestName) {
    const PARSER_MAPPINGS = {
      SyncInfo: this.parseSyncInfo,
      Transaction: this.parseTransaction,
      NewOrder: this.parseNewOrder,
      Trade: this.parseTrade,
      Market: this.parseMarket,
      MarketImage: this.parseMarketImage,
      FundRedeem: this.parseFundRedeem,
      BaseCurrency: this.parseBaseCurrency,
      Chart: this.parseChart,
    };
    return PARSER_MAPPINGS[requestName];
  }

  static parseFundRedeem(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      type: entry.type,
      token: entry.token,
      tokenName: entry.tokenName,
      status: entry.status,
      owner: entry.owner,
      time: entry.time,
      amount: entry.amount,
      blockNum: entry.blockNum,
    }));
  }

  static parseNewOrder(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      tokenAddress: entry.tokenAddress,
      orderId: entry.orderId,
      owner: entry.owner,
      status: entry.status,
      type: entry.type,
      token: entry.token,
      tokenName: entry.tokenName,
      orderType: entry.orderType,
      price: entry.price,
      sellToken: entry.sellToken,
      buyToken: entry.buyToken,
      priceMul: entry.priceMul,
      priceDiv: entry.priceDiv,
      time: entry.time,
      amount: entry.amount,
      startAmount: entry.startAmount,
      blockNum: entry.blockNum,
      decimals: entry.decimals,
    }));
  }

  static parseMarket(data) {
    return data.map((entry) => ({
      market: entry.market,
      tokenName: entry.tokenName,
      price: entry.price,
      change: entry.change,
      volume: entry.volume,
      address: entry.address,
      decimals: entry.decimals,
    }));
  }

  static parseMarketImage(data) {
    return data.map((entry) => ({
      market: entry.market,
      image: entry.image,
    }));
  }

  static parseBaseCurrency(data) {
    return data.map((entry) => ({
      pair: entry.pair,
      name: entry.name,
      address: entry.address,
    }));
  }

  static parseChart(data) {
    return data.map((entry) => ({
      tokenAddress: entry.tokenAddress,
      timeTable: entry.timeTable,
      time: entry.time,
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
    }));
  }

  static parseTrade(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      tokenAddress: entry.tokenAddress,
      type: entry.type,
      from: entry.from,
      to: entry.to,
      status: entry.status,
      soldTokens: entry.soldTokens,
      boughtTokens: entry.boughtTokens,
      tokenName: entry.tokenName,
      token: entry.token,
      orderType: entry.orderType,
      price: entry.price,
      orderId: entry.orderId,
      time: entry.time,
      amount: entry.amount,
      blockNum: entry.blockNum,
      gasUsed: entry.gasUsed,
      decimals: entry.decimals,
    }));
  }

  static parseSyncInfo(data) {
    return _.pick(data, [
      'syncBlockNum',
      'syncBlockTime',
      'syncPercent',
      'peerNodeCount',
      'addressBalances',
    ]);
  }

  static parseTransaction(data) {
    return data.map((entry) => ({
      type: entry.type,
      txid: entry.txid,
      status: entry.status,
      createdTime: entry.createdTime,
      blockNum: entry.blockNum,
      blockTime: entry.blockTime,
      gasLimit: entry.gasLimit,
      gasPrice: entry.gasPrice,
      gasUsed: entry.gasUsed,
      version: entry.version,
      senderAddress: entry.senderAddress,
      receiverAddress: entry.receiverAddress,
      name: entry.name,
      token: entry.token,
      amount: entry.amount,
    }));
  }
}

export default GraphParser;
