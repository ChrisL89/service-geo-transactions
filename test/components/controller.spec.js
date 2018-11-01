const sinon = require('sinon');
const controller = require('src/components/controller');
const Transaction = require('src/models/transaction');
const Account = require('src/models/account');
const middleWare = require('src/components/middleWare');
const fixtures = require('../fixtures');

describe('controller', function () {
  const sandbox = sinon.createSandbox();
  let res, resSendSpy, nextSpy;
  beforeEach(function () {
    resSendSpy = sandbox.spy();
    res = {
      send: resSendSpy,
    };
    nextSpy = sandbox.spy();
  });

  afterEach(function () {
    sandbox.restore();
    sandbox.reset();
  });

  describe('addTransaction', function () {
    const addTrxReq = {
      body: fixtures.ADD_TRANSACTION_PAYLOAD,
    };

    let middleWareStub;
    beforeEach(function () {
      middleWareStub = sandbox.stub(middleWare, 'pushToMiddleWare');
    });

    it('should throw an error when request body is not a valid json', function () {
      const invalidReq = { body: 'invalide json object' };
      controller.addTransaction(invalidReq, res, nextSpy);
      sinon.assert.notCalled(resSendSpy);
      sinon.assert.calledWithMatch(nextSpy, SyntaxError);
    });

    it('should send a PlaceBet object to middleware', function () {
      controller.addTransaction(addTrxReq, res, nextSpy);
      sinon.assert.calledOnce(middleWare.pushToMiddleWare);
      sinon.assert.calledWithMatch(middleWareStub, sinon.match.instanceOf(Transaction));
      middleWareStub.yield(undefined);
      sinon.assert.calledOnce(resSendSpy);
      sinon.assert.calledOnce(nextSpy);
    });

  });

  describe('signupAccount', function () {
    const signupAccountReq = {
      body: fixtures.ACCOUNT_PAYLOAD,
    };

    let middleWareStub;
    beforeEach(function () {
      middleWareStub = sandbox.stub(middleWare, 'pushToMiddleWare');
    });

    it('should throw an error when request body is not a valid json', function () {
      const invalidReq = { body: 'invalide json object' };
      controller.signupAccount(invalidReq, res, nextSpy);
      sinon.assert.notCalled(resSendSpy);
      sinon.assert.calledWithMatch(nextSpy, SyntaxError);
    });

    it('should send a Signup object to middleware', function () {
      controller.signupAccount(signupAccountReq, res, nextSpy);
      sinon.assert.calledOnce(middleWare.pushToMiddleWare);
      sinon.assert.calledWithMatch(middleWareStub, sinon.match.instanceOf(Account));
      middleWareStub.yield(undefined);
      sinon.assert.calledOnce(resSendSpy);
      sinon.assert.calledOnce(nextSpy);
    });

  });
});
