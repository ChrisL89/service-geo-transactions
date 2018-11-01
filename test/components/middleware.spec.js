const sinon = require('sinon');
const middleWare = require('src/components/middleWare');
const fixtures = require('../fixtures');
const Account = require('src/models/account');
const Transaction = require('src/models/transaction');
const log = require('src/log');
const expect = require('chai').expect;
const dataSender = require('src/components/dataSender');
const geoTransactionRepository = require('src/repository/geoTransactionRepository');

describe('middleWare', () => {

  const sandbox = sinon.createSandbox();
  const dataPacket = new Account(fixtures.ACCOUNT_PAYLOAD);
  const dataPacket2 = new Transaction(fixtures.ADD_TRANSACTION_PAYLOAD);

  beforeEach(function () {
    sandbox.stub(log, 'info');
  });

  afterEach(function () {
    sandbox.restore();
    sandbox.reset();
  });

  describe('message queue', function (){
    it('should return the data in same order' , () => {
      expect(middleWare.getMessageQueueSize()).to.be.equal(0);
      middleWare.addToMessageQueue(dataPacket);
      middleWare.addToMessageQueue(dataPacket2);
      expect(middleWare.getMessageQueueSize()).to.be.equal(2);
      const result = middleWare.getFromMessageQueue();
      const result2 = middleWare.getFromMessageQueue();
      expect(middleWare.getMessageQueueSize()).to.be.equal(0);
      expect(result).to.equal(dataPacket);
      expect(result2).to.equal(dataPacket2);
    });
  });

  describe('pushToMiddleWare', function () {
    let dataSenderStub;
    let callbackSpy;

    beforeEach(function () {
      dataSenderStub = sandbox.stub(dataSender, 'sendObject');
      callbackSpy = sandbox.spy();
      sandbox.stub(geoTransactionRepository, 'saveTransaction').returns(Promise.resolve(10));
    });

    it('should not fail if data Sender has no errors', function () {

      dataSender.sendObject.yields(undefined);
      middleWare.pushToMiddleWare(dataPacket, callbackSpy);

      sinon.assert.calledOnce(dataSenderStub);
      sinon.assert.calledOnce(callbackSpy);
      sinon.assert.calledWith(callbackSpy);
    });

    it('should fail if data Sender has errors', function () {
      dataSender.sendObject.yields(new Error('error message'));
      middleWare.pushToMiddleWare(dataPacket, callbackSpy);

      sinon.assert.calledOnce(dataSenderStub);
      sinon.assert.calledOnce(callbackSpy);
      sinon.assert.calledWithMatch(callbackSpy, sinon.match.typeOf('error'));
    });

  });

  describe('isTransactionDebuggingEnabled', function () {

    const mockConfig = {
      'enableTransactionDebugging' : 'False'
    };

    it('should return false if the config is turned off', function () {
      expect(middleWare.isTransactionDebuggingEnabled(mockConfig)).to.be.equal(false);
    });

    it ('should return true if the config is turned on', function () {
      mockConfig.enableTransactionDebugging = 'True';
      expect(middleWare.isTransactionDebuggingEnabled(mockConfig)).to.be.equal(true);
    });

  });

});
