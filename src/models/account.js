const BaseModel = require('./baseModel');

const AccountFields = BaseModel.fields;
const AccountMatcher = BaseModel.matcher;

/**
 * This is the sign up model class
 */
class Account extends BaseModel {
  constructor(obj) {
    try {
      super(obj);
    } catch (err) {
      throw new Error(`${err}, Account`);
    }
    const unmatchedList = AccountMatcher.match(obj);
    if (unmatchedList.length > 0) {
      throw new Error('Cannot parse Account');
    }
  }

  static transfer(account) {
    if (!(account instanceof Account)) {
      throw new Error(`Cannot transfer type ${typeof account} in Account`);
    }
    const transferredBaseModel = BaseModel.transfer(account);
    return Object.assign({}, transferredBaseModel);
  }
}

Account.fields = AccountFields;
Account.matcher = AccountMatcher;

module.exports = Account;
