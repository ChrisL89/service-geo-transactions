const controller = require('./controller');
const messageSchema = require('./message-schema');
const controlCenterPermission = require('../middlewares/control-centre-permissions');
function register(apiRouter) {
  apiRouter.post({
    path: {
      name: 'add',
      path: '/v1/geo-transactions/add',
      discoveryName: 'geo-transactions:add',
    },
    handlers: [controller.addTransaction],
    validate: messageSchema.addTransaction,
    response: messageSchema.addTransaction.response
  });

  apiRouter.post({
    path: {
      name: 'account-sign-up',
      path: '/v1/geo-transactions/account-sign-up',
      discoveryName: 'geo-transactions:account-sign-up',
    },
    handlers: [controller.signupAccount],
    validate: messageSchema.signUpAccount,
    response: messageSchema.signUpAccount.response
  });

  apiRouter.get({
    path: {
      name: 'get-geotransaction-history',
      path: '/v1/geo-transactions/get-geotransaction-history',
      query: {
        mandatory: ['topLatitude', 'leftLongitude', 'bottomLatitude', 'rightLongitude'],
        optional: ['startDate', 'endDate', 'limit', 'betType']
      },
      discoveryName: 'geo-transactions:find-by-geolocation'
    },
    handlers: [controlCenterPermission({read: 'venueTransactions'}), controller.getGeoTransactionHistory],
    validate: messageSchema.getGeoTransactionHistory,
    response: messageSchema.getGeoTransactionHistory.response,
    scopes: ['invenue:manage-display-devices'],
  });
}

module.exports = {
  register,
};
