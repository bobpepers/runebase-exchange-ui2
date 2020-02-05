import { satoshiToDecimal } from '../../helpers/utility';


/*
* Model for TransactionCost.
* Represents the cost for a transaction. This is fetched before the user executes a transaction.
*/

export default class TransactionCost {
  type

  token

  amount

  gasLimit

  gasCost

  constructor(txCost, baseCurrencyPair) {
    Object.assign(this, txCost);

    if (this.token !== baseCurrencyPair) {
      this.amount = satoshiToDecimal(this.amount, 8);
    }
  }
}
