const sinon = require('sinon');
const routes = require('src/components/routes');
const controller = require('src/components/controller');
const messageSchema = require('src/components/message-schema');


describe('routes', function () {
  const sandbox = sinon.createSandbox();
  const postSpy = sandbox.spy();
  const getSpy = sandbox.spy();
  const apiRouterMock = { post: postSpy, get: getSpy};
  routes.register(apiRouterMock);

  afterEach(function (done) {
    sandbox.restore();
    sandbox.reset();
    done();
  });

  describe('add', function () {
    it ('should call with valid name, path, and handlers', function () {
      sinon.assert.calledWith(postSpy, {
        path: {
          name: 'add',
          path: '/v1/geo-transactions/add',
          discoveryName: 'geo-transactions:add',
        },
        handlers: [controller.addTransaction],
        validate: messageSchema.addTransaction,
        response: messageSchema.addTransaction.response
      });
    });
  });

  describe('account-sign-up', function () {
    it ('should call with valid name, path, and handlers', function () {
      sinon.assert.calledWith(postSpy, {
        path: {
          name: 'account-sign-up',
          path: '/v1/geo-transactions/account-sign-up',
          discoveryName: 'geo-transactions:account-sign-up',
        },
        handlers: [controller.signupAccount],
        validate: messageSchema.signUpAccount,
        response: messageSchema.signUpAccount.response
      });
    });
  });


  describe('get-geotransaction-history', function () {
    it ('should call with valid name, path, and handlers', function () {
      sinon.assert.calledWith(getSpy, {
        path: {
          name: 'get-geotransaction-history',
          path: '/v1/geo-transactions/get-geotransaction-history',
          query: {
            mandatory: ['topLatitude', 'leftLongitude', 'bottomLatitude', 'rightLongitude'],
            optional: ['startDate', 'endDate', 'limit', 'betType']
          },
          discoveryName: 'geo-transactions:find-by-geolocation',
        },
        handlers: [sinon.match.func, controller.getGeoTransactionHistory],
        validate:messageSchema.getGeoTransactionHistory,
        response:messageSchema.getGeoTransactionHistory.response,
        scopes: ['invenue:manage-display-devices'],
      });
    });
  });

});
