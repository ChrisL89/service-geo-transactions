'use strict';

/**
 * Class to handle all database actions
 */

const bookshelf = require('./bookshelf');
const log = require('../log');
const history = require('../models/history');

const TYPE_MAP = {
  PLACE_BET: 'PLACE_BET',
  SIGN_UP: 'ACCOUNT_SIGNUP', //This is used by Tab.
  ACCOUNT_SIGNUP: 'ACCOUNT_SIGNUP' //This is used by UBET.
};

const GeoTransactionRepository = bookshelf.Model.extend({
  tableName: 'geo_transactions',
});


const SELECT_COLUMNS = `geo_transactions.id,
                  geo_transactions.server_create_time,
                  geo_transactions.client_create_time,
                  geo_transactions.account_id,
                  geo_transactions.type,
                  geo_transactions.transaction_id,
                  ST_X(geo_transactions.geo_venue_location::geometry) as longitude,
                  ST_Y(geo_transactions.geo_venue_location::geometry) as latitude,
                  geo_transactions.geo_uncertainty,
                  geo_transactions.ticket_serial_numbers,
                  geo_transactions.bet_transaction_number,
                  geo_transactions.brand`;


/**
 * Save transaction record into geo_transactions table
 *
 * DWR-1267 bet_transaction_number is as as as transactionId for UBET
 * id integer NOT NULL,
 * server_create_time timestamp with time zone DEFAULT now() NOT NULL, "<<--- time of the request received by GeoTransaction service"
 * client_create_time timestamp with time zone NOT NULL, "<<--- UBET tranDateTime"
 * account_id integer NOT NULL, "<<--- UBET accountNum"
 * type commission_type NOT NULL, "<<--- UBET need a default value"
 * transaction_id text, "<<--- UBET default to null"
 * geo_venue_location geography(Point,4326), "<<---- UBET longtitude and latitude fields"
 * geo_uncertainty numeric, "<<--- UBET geoUncertainty"
 * ticket_serial_numbers text, "<<--- UBET SerialNumbers (column should be defined as array of strings, or use separate table to store serial numbers)"
 * bet_transaction_number text, "NOT NULL <<--- UBET transactionId"
 * brand text, <<---- "identified brand. 1=UBET, 2=TAB"
 *
 * @param databaseObject
 * @param callback
 */
function saveTransaction(databaseObject, callback) {

  //Prepare all values
  const client_create_time = databaseObject.dateTime;
  const account_id = databaseObject.accountId;
  const type = TYPE_MAP[databaseObject.type];
  const geo_venue_location = `SRID=4326;POINT(${databaseObject.geoLocation.longitude} ${databaseObject.geoLocation.latitude})`;
  const geo_uncertainty = databaseObject.geoLocation.uncertainty;
  const ticket_serial_numbers = databaseObject.betTransactionNumbers && databaseObject.betTransactionNumbers.join(',') || undefined;
  const bet_transaction_number = databaseObject.transactionId;
  const brand = databaseObject.brand;

  //Process save query
  GeoTransactionRepository.forge({
    client_create_time,
    account_id,
    type,
    geo_venue_location,
    geo_uncertainty,
    ticket_serial_numbers,
    bet_transaction_number,
    brand
  })
    .save()
    .then(function (geo_transaction) {
      callback(null, geo_transaction);
    })
    .catch(function (err) {
      callback(err);
    });

}


/**
 * Find all transaction records matching criteria and return the results
 *
 * @param req
 * @param res
 * @param next
 */
function getGeoTransactionHistory(req, res, next) {

  //Prepare raw query statement
  let condition = '';
  let limitSql = '';
  const query = req.query;
  const topLatitude = parseFloat(query.topLatitude);
  const leftLongitude = parseFloat(query.leftLongitude);
  const bottomLatitude = parseFloat(query.bottomLatitude);
  const rightLongitude = parseFloat(query.rightLongitude);
  const startDate = query.startDate;
  const endDate = query.endDate;
  const betType = query.betType;
  const limit = query.limit;

  const parameters = [leftLongitude, bottomLatitude, rightLongitude, topLatitude];

  if (startDate) {
    //use the commented one once the DB query wrapper is available
    condition += ' AND client_create_time >= ?';
    parameters.push(startDate);
  }

  if (endDate) {
    //use the commented one once the DB query wrapper is available
    condition += ' AND client_create_time <= ?';
    parameters.push(endDate);
  }

  if (betType) {
    //use the commented one once the DB query wrapper is available
    condition += ' AND type = ?';
    parameters.push(betType);
  }

  if (limit) {
    //use the commented one once the DB query wrapper is available
    limitSql += 'LIMIT ?';
    parameters.push(limit);
  }

  const queryStatement = 'SELECT ' + SELECT_COLUMNS + ' FROM geo_transactions  WHERE ST_Covers(ST_MakeEnvelope(?, ?, ?, ?, 4326), geo_transactions.geo_venue_location::geometry) ' + condition + ' ORDER BY server_create_time ' + limitSql + ';';


  try {
    //We had to use raw query here because bookselfJS seems not support calling sql functions in the query, in this case: ST_Covers(ST_MakeEnvelope.
    //const queryStatement = await getQueryStatement(req);
    bookshelf.knex.raw(queryStatement, parameters).then(function (result) {
      const records = history.toApiResponses(result.rows);
      res.send({ records });
      next();
    });
  } catch (err) {
    log.error(`Error occurred while querying geoTransactionHistory table - {${err}}`);
    throw err;
  }
}




module.exports = {
  saveTransaction,
  getGeoTransactionHistory,
  TYPE_MAP
};
