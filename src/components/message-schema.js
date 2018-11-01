'use strict';


const transaction = require('../models/transaction');
const account = require('../models/account');
const history = require('../models/history');

module.exports = {
  addTransaction: {
    body: transaction.matcher,
    response: {
    }
  },
  signUpAccount: {
    body: account.matcher,
    response: {
    }
  },
  getGeoTransactionHistory: {
    query: history.getHistoryRequestMatcher,
    response: {

    }
  }

};
