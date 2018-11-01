const GEO_LOCATION_PAYLOAD = {
  latitude: '-27.491640789999991',
  longitude: '153.03453880999993',
  uncertainty: '165',
};

const BASE_PAYLOAD = {
  accountId: '52211149',
  dateTime: '2018-06-13T23:59:40Z',
  type: 'PLACE_BET',
  geoLocation: GEO_LOCATION_PAYLOAD,
  brand: 'TAB',
};

const ACCOUNT_PAYLOAD = BASE_PAYLOAD;

const ADD_TRANSACTION_PAYLOAD = {
  ...BASE_PAYLOAD,
  transactionId: 'BF75FCD3-9EF5-4C3F-B718-6C297A0A09DC',
  betTransactionNumbers: ['FO_953544719', 'PM_953544715'],
};

module.exports = {
  GEO_LOCATION_PAYLOAD,
  BASE_PAYLOAD,
  ACCOUNT_PAYLOAD,
  ADD_TRANSACTION_PAYLOAD,
};
