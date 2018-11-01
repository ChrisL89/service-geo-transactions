'use strict';

const events = require('events');
const uuid = require('uuid/v4');
const dataSender = require('./dataSender');
const Transaction = require('../models/transaction');
const PlaceBet = require('../models/kafkaObjects/placeBet');
const Account = require('../models/account');
const Signup = require('../models/kafkaObjects/signup');
const log = require('../log');
const config = require('../env').config;
const emitter = new events.EventEmitter();
const messageQueue = [];
const geoTransactionRepo = require('../repository/geoTransactionRepository');

/**
 * save the payload object to database as well as pushing to kafka
 *
 * @param dataObject
 * @param callback
 */
const pushToMiddleWare = (dataObject, callback) => {
  log.info(`middleware: adding message packet to the queue: ${dataObject.constructor.name}`);
  try {
    addToMessageQueue(dataObject);
    emitter.emit('messageQueueUpdated');
  } catch (err) {
    log.error(`geo-transactions:middleware:emit and push to queue:error: ${err}`);
  }
  return dispatchDataToProducer(dataObject, callback);
};

/**
 * get current queue size
 *
 * @returns {number}
 */
const getMessageQueueSize = () => {
  return messageQueue.length;
};

/**
 * add packet to the queue
 *
 * @param dataObject
 * @returns {number}
 */
const addToMessageQueue = dataObject => {
  return messageQueue.push(dataObject);
};

/**
 * Grab packet from the queue
 *
 * @returns {object}
 */
const getFromMessageQueue = () => {
  return messageQueue.shift();
};

/**
 * Triggered by emitter: messageQueueUpdated to grab packet from queue and save it to Database
 * @returns {Promise<void>}
 */
const dispatchData = async () => {
  if (getMessageQueueSize() > 0) {
    try {
      const dataObject = getFromMessageQueue();
      log.info(`middleware: received message from queue - {${dataObject}}`);
      if (isTransactionDebuggingEnabled(config)) {
        log.info('middleware: saving message to database');
        geoTransactionRepo.saveTransaction(dataObject, function (err, geo_transaction) {
          if (err) {
            log.error(`Error occurred while inserting records to geo transaction table - {${err}}`);
          } else {
            log.info(`Transaction saved into DB with id: ${geo_transaction.get('id')}`);
          }
        });
      }
      log.info('middleware: successfully processed message');
    } catch (error) {
      log.error(`middleware error: ${error}`);
      // TODO: retry
    }
  }
};

/**
 * function to publish transaction to kafka
 *
 * @param dataObject
 * @param callback
 */
const dispatchDataToProducer = (dataObject, callback) => {

  let kafkaObject;
  const messageId = uuid();
  switch (dataObject.constructor) {
  case Transaction:
    kafkaObject = new PlaceBet(Transaction.transfer(dataObject), messageId);
    break;
  case Account:
    kafkaObject = new Signup(Account.transfer(dataObject), messageId);
    break;
  default:
    log.error('Cannot transfer object to kafkaObject', dataObject);
    return callback(new Error(`Cannot transfer object ${dataObject.constructor.name} to kafkaObject`));
  }

  dataSender.sendObject(kafkaObject, (err, result) => {
    if (err) {
      log.error(`middleware: failure published data to kafka: ${err}`);
      return callback(err);
    }
    log.info(`middleware: successfully published data to kafka: ${result}`);
    return callback(null, result);
  });
};

/**
 * This check will control whether we will write geoTransaction records to DB or not.
 *
 * @returns boolean
 */
const isTransactionDebuggingEnabled = config => {

  if (config.hasOwnProperty('enableTransactionDebugging')) {
    return (config.enableTransactionDebugging.toLowerCase() === 'true');
  }
  return false;

};


emitter.on('messageQueueUpdated', dispatchData);

module.exports = {
  pushToMiddleWare,
  addToMessageQueue,
  getFromMessageQueue,
  getMessageQueueSize,
  isTransactionDebuggingEnabled,
};
