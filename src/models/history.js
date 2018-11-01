const strummer = require('strummer');

const getHistoryMessageSchema = {
  topLatitude: new strummer.number({parse: true, min: -90, max: 90}),
  leftLongitude: new strummer.number({parse: true, min: -180, max: 180}),
  bottomLatitude: new strummer.number({parse: true, min: -90, max: 90}),
  rightLongitude: new strummer.number({parse: true, min: -180, max: 180})

};

const getHistoryRequestMatcher = new strummer.object(getHistoryMessageSchema);


/**
 *
 * @param row
 */
function toApiRecord(row) {
  return {
    id: row.id,
    serverCreateTime: row.server_create_time,
    clientCreateTime: row.client_create_time,
    accountId: row.account_id,
    type: row.type,
    transactionId: row.transaction_id,
    geoLocation: {
      latitude: row.latitude,
      longitude: row.longitude,
      uncertainty: row.geo_uncertainty
    },
    betTransactionNumber: row.bet_transaction_number,
    ticketSerialNumbers: row.ticket_serial_numbers,
    brand: row.brand

  };
}



/**
 * This is to convert sql results to proper API Response
 * @param rows sql query results
 * @returns {*}
 */
function toApiResponses(rows) {

  return rows.map(toApiRecord);
}



module.exports = {
  getHistoryRequestMatcher,
  toApiResponses
};
