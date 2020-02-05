/*
* Model for Markets
*
*
*/
export default class Market {
  market = ''

  tokenName = ''

  price = ''

  change = ''

  volume = ''

  // for invalid option
  localizedInvalid = {};

  constructor(market, app) {
    Object.assign(this, market);
    this.app = app;
    this.market = market.market;
    this.tokenName = market.tokenName;
    this.price = market.price;
    this.change = market.change;
    this.volume = market.volume;
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
