const sinon = require('sinon');
const errors = require('restify-errors');
const permissionsMiddleware = require('src/middlewares/control-centre-permissions');

describe('Control Centre Permissions Middleware', function () {
  const sandbox = sinon.createSandbox();
  let req, res, next, options;
  const assertNextCalledWithError = (errorType, expectedMessage) => {
    sinon.assert.calledWithExactly(next, sinon.match.instanceOf(errorType).and(sinon.match.has('message', expectedMessage)));
  };

  beforeEach(function () {
    options = {
      read: 'aPermission'
    };
    next = sandbox.stub();
    req = {
      jwt: {
        'client.scopes': ['scope1', 'scope2'],
        'control-centre.permissions': {
          read: {
            aPermission: true,
            bPermission: true
          },
          write: {
            aPermission: true,
            cPermission: true
          }
        }
      }
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should pass if there is no jwt on the request', function () {
    options.read = 'xPermission';
    delete req.jwt;
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should pass if the request has the required permissions', function () {
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should generate an error if the request does not the required permissions', function () {
    options.read = 'xPermission';
    permissionsMiddleware(options)(req, res, next);
    assertNextCalledWithError(errors.ForbiddenError, 'Insufficient privileges');
  });

  it('should pass if the request does not have the required permissions but has one of the override scopes', function () {
    options.read = 'xPermission';
    options.overrideScopes = ['scope5', 'scope1'];
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should pass if the request does not have the required permissions but override scopes are specified the request has a scope of *', function () {
    options.read = 'xPermission';
    options.overrideScopes = ['scope5', 'scope1'];
    req.jwt['client.scopes'] = ['*'];
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should generate an if the request does not the required permissions and the request has a scope of * but override scopes are not specified', function () {
    options.read = 'xPermission';
    req.jwt['client.scopes'] = ['*'];
    permissionsMiddleware(options)(req, res, next);
    assertNextCalledWithError(errors.ForbiddenError, 'Insufficient privileges');
  });

  it('should pass if multiple permissions are specified and the request has one of them', function () {
    options.read = ['xPermission', 'bPermission'];
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should pass if read and write permissions are specified and the request has one of them', function () {
    options.read = ['xPermission', 'yPermission'];
    options.write = ['xPermission', 'cPermission'];
    permissionsMiddleware(options)(req, res, next);
    sinon.assert.calledWithExactly(next);
  });

  it('should generate and error if read and write permissions are specified and the request has none of them', function () {
    options.read = ['xPermission', 'cPermission'];
    options.write = ['xPermission', 'bPermission'];
    permissionsMiddleware(options)(req, res, next);
    assertNextCalledWithError(errors.ForbiddenError, 'Insufficient privileges');
  });
});
