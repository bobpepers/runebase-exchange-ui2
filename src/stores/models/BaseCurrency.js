/*
* Model for Markets
*
*
*/
export default class BaseCurrency {
  pair = ''

  name = ''

  address = ''

  // for invalid option
  localizedInvalid = {};

  constructor(base, app) {
    Object.assign(this, base);
    this.app = app;
    this.pair = base.pair;
    this.name = base.name;
    this.address = base.address;
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
