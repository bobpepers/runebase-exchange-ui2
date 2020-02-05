/*
* Model for FundRedeem
*
*
*/
export default class FundRedeem {
  txid = ''

  type = ''

  token = ''

  tokenName = ''

  status = ''

  owner = ''

  time = ''

  amount = ''

  blockNum = ''

  // for invalid option
  localizedInvalid = {};

  constructor(fundRedeem, app) {
    Object.assign(this, fundRedeem);
    this.app = app;
    this.txid = fundRedeem.txid;
    this.type = fundRedeem.type;
    this.token = fundRedeem.token;
    this.tokenName = fundRedeem.tokenName;
    this.status = fundRedeem.status;
    this.owner = fundRedeem.owner;
    this.time = fundRedeem.time;
    this.amount = fundRedeem.amount;
    this.blockNum = fundRedeem.blockNum;
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
