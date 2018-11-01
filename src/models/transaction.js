const strummer = require('strummer');
const BaseModel = require('./baseModel');
const MD5 = require('../utils/hash').MD5;

const TransactionMatcherFields = Object.freeze(Object.assign({}, BaseModel.matcherFields, {
  transactionId: new strummer.string({ optional: true }),
  betTransactionNumbers: new strummer.array({ of: 'string', optional: true }),
}));

const TransactionMatcher = new strummer.object(TransactionMatcherFields);

const TransactionFields = Object.freeze(Object.keys(TransactionMatcherFields));

// https://jira.tabcorp.com.au/browse/DWR-1319
const TSN_PREFIXES = ['FO_', 'PM_'];

/**
 * This is the place bet model class
 */
class Transaction extends BaseModel {
  constructor(obj) {
    try {
      super(obj);
    } catch (err) {
      throw new Error(`${err}, Transaction`);
    }
    const unmatchedList = TransactionMatcher.match(obj);
    if (unmatchedList.length > 0) {
      throw new Error('Cannot parse Transaction');
    }
    obj.betTransactionNumbers = obj.betTransactionNumbers || [];
    Object.assign(this, {
      transactionId: String(obj.transactionId),
      betTransactionNumbers: obj.betTransactionNumbers.map(n => String(n)).map(tsn => {
        const prefixIdx = TSN_PREFIXES.findIndex(prefix => tsn.startsWith(prefix));
        const prefix = prefixIdx >= 0 ? TSN_PREFIXES[prefixIdx] : '';
        return `${prefix}${MD5(tsn.replace(prefix, ''))}`;
      }),
    });
  }

  static transfer(trx) {
    if (!(trx instanceof Transaction)) {
      throw new Error(`Cannot transfer type ${typeof trx} in Transaction`);
    }
    const transferredBaseModel = BaseModel.transfer(trx);
    return Object.assign({}, {
      ...transferredBaseModel,
      transactionId: trx.transactionId,
      serialNumbers: trx.betTransactionNumbers,
    });
  }
}

Transaction.fields = TransactionFields;
Transaction.matcher = TransactionMatcher;

module.exports = Transaction;
