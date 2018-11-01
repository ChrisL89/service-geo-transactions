const sinon = require('sinon');
const routes = require('src/components/status/routes');
const controller = require('src/components/status/controller');


describe('routes', function () {
  const sandbox = sinon.createSandbox();
  const getSpy = sandbox.spy();
  const apiRouterMock = { get: getSpy};
  routes.register(apiRouterMock);

  afterEach(function (done) {
    sandbox.restore();
    sandbox.reset();
    done();
  });

  describe('status', function () {
    it ('should call with valid name, path, and handlers', function () {
      sinon.assert.calledWith(getSpy, {
        name: 'status',
        path: '/v1/geo-transactions/status',
        handlers: [controller.get]
      });
    });
  });

  describe('status/details', function () {
    it ('should call with valid name, path, and handlers', function () {
      sinon.assert.calledWith(getSpy, {
        name: 'status-details',
        path: '/v1/geo-transactions/status/details',
        handlers: [controller.details]
      });
    });
  });
});
