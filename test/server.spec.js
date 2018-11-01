const request = require('supertest');
const sinon = require('sinon');
const testServer = require('src/server');
const env = require('src/env');
const geoTransactionRepo = require('src/repository/geoTransactionRepository');
const jwtHelper = require('./jwt-helper');

const responseHelper = (expectFunction, done) => (err, res) => {
  if (err) {
    return done(err);
  }
  expectFunction(res);
  done();
};

describe('server', function () {
  const sandbox = sinon.createSandbox();
  const url = '/v1/geo-transactions/get-geotransaction-history?topLatitude=1&leftLongitude=2&bottomLatitude=3&rightLongitude=4';
  let server, saveJWTKeyPath;

  before(function () {
    saveJWTKeyPath = env.config.jwtSignPublicKeyPath;
    env.config.jwtSignPublicKeyPath = __dirname + '/keys/jwt-sign.pem';
    server = testServer.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  afterEach(function () {
    sandbox.restore();
    env.config.jwtSignPublicKeyPath = saveJWTKeyPath;
  });

  describe('get-geotransaction-history', function () {
    beforeEach(function () {
      sandbox.stub(geoTransactionRepo, 'getGeoTransactionHistory').callsFake(function (req, res, next) {
        res.send({});
        next();
      });
    });

    it('should call with no JWT attached', function (done) {
      request(server).get(url)
        .expect(200)
        .end(responseHelper(res => {
          expect(res.body).to.eql({});
        }, done));
    });

    it('should call with JWT with correct permissions', function (done) {
      const jwt = jwtHelper.createKey({'control-centre.permissions': {read: {venueTransactions: true}}});
      request(server).get(url)
        .set('X-JWT', jwt)
        .expect(200)
        .end(responseHelper(res => {
          expect(res.body).to.eql({});
        }, done));
    });

    it('should return a forbidden error when called with JWT without correct permissions', function (done) {
      const jwt = jwtHelper.createKey({'control-centre.permissions': {read: {aPermission: true}}});
      request(server).get(url)
        .set('X-JWT', jwt)
        .expect(403)
        .end(responseHelper(res => {
          expect(res.body).to.eql({
            code: 'Forbidden',
            message: 'Insufficient privileges',
          });
        }, done));
    });

    it('should return a forbidden error when called with no control centre permission', function (done) {
      const jwt = jwtHelper.createKey({'other.permissions': {read: {venueTransactions: true}}});
      request(server).get(url)
        .set('X-JWT', jwt)
        .expect(403)
        .end(responseHelper(res => {
          expect(res.body).to.eql({
            code: 'Forbidden',
            message: 'Insufficient privileges',
          });
        }, done));
    });
  });
});
