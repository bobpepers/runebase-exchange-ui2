/* eslint-disable no-self-assign */
import _ from 'lodash';

export default class AddressBalance {
  address = ''

  balance = ''

  Wallet = {}

  Exchange = {}

  constructor(addressBalance) {
    Object.assign(this, addressBalance);
    this.address = this.address;
    console.log(addressBalance);
    try {
      this.balance = _.omit(JSON.parse(addressBalance.balance), ['balance']);
    } catch (e) {
      return false;
    }

    if (!_.isEmpty(this.balance.Wallet)) {
      Object.keys(this.balance.Wallet).forEach((key) => {
        this.Wallet[key] = this.balance.Wallet[key];
      });
    }

    if (!_.isEmpty(this.balance.Exchange)) {
      Object.keys(this.balance.Exchange).forEach((key) => {
        this.Exchange[key] = this.balance.Exchange[key];
      });
    }
  }
}
