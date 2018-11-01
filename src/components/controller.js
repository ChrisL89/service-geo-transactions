const errors = require('restify-errors');
const Transaction = require('../models/transaction');
const Account = require('../models/account');
const log = require('../log');
const middleware = require('./middleWare.js');
const geoTransactionRepo = require('../repository/geoTransactionRepository');
const apiError = require('../utils/apiError');
const _ = require('lodash');

const middlewareCallbackProducer = (payload, res, next) => err => {
  if (err) {
    log.debug(err, 'geo-transctions:api:call-back:middleware-callback:error');
    sendError(res, err);
    return next();
  }
  res.send(payload);
  next();
};

/**
 * Send details of a transaction (bet placement etc) to Kafka
 * 
 * Sample JSON for a request:
 * {
 *  "accountId": 206814054,
 *  "betTransactionNumbers": ["FO_-1951401334"],
 *  "brand": "UBET",
 *  "type": "PLACE_BET",
 *  "transactionId": "E12D1DE9-09A0-42CC-91EB-57F24EE8910F",
 *  "dateTime": "2018-08-29T14:03:15.05Z",
 *  "geoLocation": {
 *      "uncertainty": 65,
 *      "longitude": 153.04135781478075,
 *      "latitude": -27.431450931434799
 *  }
 * }
 */
function addTransaction(req, res, next) {
  try {
    if (typeof req.body !== 'object') {
      return next(new errors.BadRequestError('Body is not in JSON format'));
    }
    const transaction = new Transaction(req.body);
    const middlewareCallback = middlewareCallbackProducer(transaction, res, next);
    middleware.pushToMiddleWare(transaction, middlewareCallback);
  } catch (err) {
    log.debug(err, 'geo-transactions:api:add-transaction:catched:error');
    sendError(res, err);
    return next();
  }
}

/**
 * Send details of a signup to Kafka
 * 
 * Sample JSON for a request:
 * {
 *   "accountId": 1000,
 *   "brand": "UBET",
 *   "dateTime": "2018-08-30T01:40:00.00Z",
 *   "geoLocation": {
 *       "latitude": -27.4911983,
 *       "longitude": 153.0349983,
 *       "uncertainty": 25
 *   },
 *   "type": "ACCOUNT_SIGNUP"
 * }
 */
function signupAccount(req, res, next) {
  try {
    if (typeof req.body !== 'object') {
      return next(new errors.BadRequestError('Body is not in JSON format'));
    }
    const account = new Account(req.body);
    const middlewareCallback = middlewareCallbackProducer(account, res, next);
    middleware.pushToMiddleWare(account, middlewareCallback);

  } catch (err) {
    log.debug(err, 'geo-transactions:api:signup-account:catched:error');
    sendError(res, err);
    return next();
  }
}

/**
 * Get the transaction history for a given area and timeframe.
 * 
 * Header:
 *  Bearer: An identity token with the required privelidges to view the history
 * Params (with sample values):
 *  topLatitude: -15
 *  leftLongitude: 150
 *  bottomLatitude: -40
 *  rightLongitude: 175
 *  betType: "ACCOUNT_SIGNUP"
 *  limit: 3
 *  startDate: "1989-01-07T11:00:00.000Z"
 */
function getGeoTransactionHistory(req, res, next) {
  try {
    geoTransactionRepo.getGeoTransactionHistory(req, res, next);
  } catch (err) {
    log.debug(err, 'geo-transactions:api:get-geotransaction-history:catched:error');
    sendError(res, err);
    return next();
  }
}

function sendError(res, err) {
  try {
    if (_.isString(err)) {
      err = new apiError({ message: err });
    } else if (!(err instanceof apiError)) {
      // Handles built-in Error instances.
      err = new apiError(err);
    }
    
    log.error({ 'api-error': err }, 'Service error');
    res.send(err.status, {
      error: _.pick(err, 'code', 'message', 'details'),
    });
  } catch (thrownError) {
    // Our standard logging mechanisms have failed, so at least log to console
    // before completing the request.
    console.error(thrownError.stack); // eslint-disable-line no-console
  }
}

module.exports = {
  addTransaction,
  signupAccount,
  getGeoTransactionHistory,
};
