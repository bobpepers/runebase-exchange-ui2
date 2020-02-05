import _ from 'lodash';

export const TYPE = {
  syncInfo: 'SyncInfo',
  transaction: 'Transaction',
  newOrder: 'NewOrder',
  trade: 'Trade',
  market: 'Market',
  marketImage: 'MarketImage',
  fundRedeem: 'FundRedeem',
  baseCurrency: 'BaseCurrency',
  chart: 'Chart',
};

const TYPE_DEF = {

  NewOrder: `
    txid
    tokenAddress
    orderId
    owner
    token
    tokenName
    price
    type
    orderType
    sellToken
    buyToken
    priceMul
    priceDiv
    time
    amount
    startAmount
    blockNum
    status
    decimals
  `,

  Trade: `
    txid
    tokenAddress
    type
    from
    to
    status
    soldTokens
    boughtTokens
    tokenName
    token
    orderType
    price
    orderId
    time
    amount
    blockNum
    gasUsed
    decimals
  `,

  FundRedeem: `
    txid
    type
    token
    tokenName
    status
    owner
    time
    amount
    blockNum
  `,

  Market: `
    market
    tokenName
    price
    change
    volume
    address
    decimals
  `,

  Chart: `
    tokenAddress
    timeTable
    time
    open
    high
    low
    close
    volume
  `,

  MarketImage: `
    market
    image
  `,

  BaseCurrency: `
    pair
    name
    address
  `,

  SyncInfo: `
    syncBlockNum
    syncBlockTime
    syncPercent
    peerNodeCount
    addressBalances {
      address
      balance
    }
  `,

  Transaction: `
    type
    txid
    status
    createdTime
    blockNum
    blockTime
    gasLimit
    gasPrice
    gasUsed
    version
    senderAddress
    receiverAddress
    name
    token
    amount
  `,
};

const MUTATIONS = {

  transfer: {
    mapping: [
      'senderAddress',
      'receiverAddress',
      'token',
      'amount',
    ],
    return: `
      txid
      createdTime
      version
      type
      status
      senderAddress
      receiverAddress
      token
      amount
    `,
  },
  transferExchange: {
    mapping: [
      'senderAddress',
      'receiverAddress',
      'token',
      'amount',
    ],
    return: `
      txid
      createdTime
      version
      type
      status
      senderAddress
      receiverAddress
      token
      amount
    `,
  },
  redeemExchange: {
    mapping: [
      'senderAddress',
      'receiverAddress',
      'token',
      'amount',
    ],
    return: `
      txid
      createdTime
      version
      type
      status
      senderAddress
      receiverAddress
      token
      amount
    `,
  },
  orderExchange: {
    mapping: [
      'senderAddress',
      'receiverAddress',
      'token',
      'amount',
      'price',
      'orderType',
    ],
    return: `
      txid
      createdTime
      version
      type
      status
      senderAddress
      receiverAddress
      token
      amount
    `,
  },
  cancelOrderExchange: {
    mapping: [
      'senderAddress',
      'orderId',
    ],
    return: `
      txid
      createdTime
      type
      status
      senderAddress
      receiverAddress
    `,
  },
  executeOrderExchange: {
    mapping: [
      'senderAddress',
      'orderId',
      'exchangeAmount',
    ],
    return: `
      txid
      createdTime
      type
      status
      senderAddress
      receiverAddress
    `,
  },
};

const ENUMS = {
  direction: [
    'ASC',
    'DESC',
  ],

  status: [
    'PENDING',
    'WITHDRAW',
    'SUCCESS',
    'FAIL',
    'ACTIVE',
    'CANCELED',
    'FULFILLED',
    'PENDINGCANCEL',
  ],

  type: [
    'TRANSFER',
    'DEPOSITEXCHANGE',
    'WITHDRAWEXCHANGE',
    'CANCELORDER',
    'BUYORDER',
    'SELLORDER',
    'EXECUTEORDER',
  ],
};

export function isValidEnum(key, value) {
  const isEnum = _.has(ENUMS, key);
  const isValid = _.includes(ENUMS[key], value);
  return isEnum && isValid;
}

export function getTypeDef(queryName) {
  return TYPE_DEF[queryName];
}

export function getMutation(mutationName) {
  return MUTATIONS[mutationName];
}
