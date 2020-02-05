/*
* Model for NewOrders
*
*
*/
export default class NewOrder {
  txid = ''

  type = ''

  status = ''

  token = ''

  tokenName = ''

  price = ''

  orderId = ''

  owner = ''

  sellToken = ''

  buyToken = ''

  priceMul = ''

  priceDiv = ''

  time = ''

  amount = ''

  blockNum = ''

  decimals = ''

  // for invalid option
  localizedInvalid = {};

  constructor(newOrder, app) {
    Object.assign(this, newOrder);
    this.app = app;
    this.amount = newOrder.amount;
    this.txid = newOrder.txid;
    this.status = newOrder.status;
    this.token = newOrder.token;
    this.tokenName = newOrder.tokenName;
    this.price = newOrder.price;
    this.type = newOrder.type;
    this.sellToken = newOrder.sellToken;
    this.buyToken = newOrder.buyToken;
    this.priceMul = newOrder.priceMul;
    this.priceDiv = newOrder.priceDiv;
    this.owner = newOrder.owner;
    this.time = newOrder.time;
    this.amount = newOrder.amount;
    this.blockNum = newOrder.blockNum;
    this.decimals = newOrder.decimals;
    this.localizedInvalid = {
      en: 'Invalid',
      zh: '无效',
      ko: '무효의',
      parse(locale) {
        return this[locale.slice(0, 2)];
      },
    };
  }
}
