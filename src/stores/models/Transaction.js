import { gasToRunebase } from '../../helpers/utility';


/*
* Model for Transactions.
* Represents pending actions to contracts that are awaiting acceptance by the blockchain.
* Transactions are currently local to each user's machine.
*/
export default class Transaction {
  type = '' // One of: [..., DESPOSITEXCHANGE, WITHDRAWEXCHANGE, ...]

  txid = '' // Transaction ID assigned by the blockchain

  status = '' // One of: [PENDING, SUCCESS, FAIL]

  createdTime = '' // UNIX timestamp when Transaction was created

  blockNum = 0 // Block number when Transaction was recorded on blockchain

  blockTime = '' // Block timestamp for blockNum

  gasLimit = 0 // Gas limit set

  gasPrice = 0 // Gas price set

  gasUsed = 0 // Actual gas used

  senderAddress = '' // Sender's address

  receiverAddress = '' // Receiver's address. Only used for TRANSFER types.

  name = '' // Name of the event

  optionIdx = 0 // Result index used for Transaction. eg. For a bet, this would be the result index the user bet on.

  token = '' // Token type used for Transaction.

  amount = '' // Amount of token used

  version = 0 // Current version of the contract. To manage deprecations later.

  // for invalid option
  localizedInvalid = {};

  constructor(transaction) {
    Object.assign(this, transaction);
    this.gasLimit = Number(this.gasLimit);
    this.gasPrice = Number(this.gasPrice);
    this.fee = gasToRunebase(this.gasUsed);
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
