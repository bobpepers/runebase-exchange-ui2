/*
* Model for Chart
*
*
*/
export default class Ohlc {
  tokenAddress

  timeTable

  time

  open

  high

  low

  close

  // for invalid option
  localizedInvalid = {};

  constructor(chart, app) {
    Object.assign(this, chart);
    this.app = app;
    this.tokenAddress = chart.tokenAddress;
    this.timeTable = chart.timeTable;
    this.time = chart.time;
    this.open = chart.open;
    this.high = chart.high;
    this.low = chart.low;
    this.close = chart.close;
    this.localizedInvalid = {
      en: 'Invalid',
      pt: 'Portuguese',
      nl: 'Nederlands',
      parse(locale) {
        return this[locale.slice(0, 2)];
      },
    };
  }
}
