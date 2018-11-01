const strummer = require('strummer');
const BaseModel = require('src/models/baseModel');
const Transaction = require('src/models/transaction');
const fixtures = require('../fixtures');

describe('Transaction', function () {
  const sandbox = sinon.createSandbox();

  afterEach(function () {
    sandbox.restore();
  });

  describe('matcher', function () {
    it('should be a strummer matcher instance', function () {
      expect(Transaction.matcher).to.be.an.instanceOf(strummer.Matcher);
    });
  });

  describe('fields', function () {
    it('should be a frozen list', function () {
      expect(Transaction.fields).to.be.frozen;
      expect(Transaction.fields).to.be.an.instanceOf(Array);
    });

    it('should contains 2 optional fields', function () {
      expect(Transaction.fields).contains('transactionId');
      expect(Transaction.fields).contains('betTransactionNumbers');
    });
  });

  describe('constructor', function () {
    it('should throw error when invalid object', function () {
      expect(() => new Transaction()).to.throw('Cannot parse BaseModel, Transaction');
    });

    it('should extended from BaseModel', function () {
      const validTransaction = new Transaction(fixtures.ADD_TRANSACTION_PAYLOAD);
      expect(validTransaction).to.be.instanceOf(BaseModel);
      expect(validTransaction).to.be.instanceOf(Transaction);
    });

    it('should parse the fields', function () {
      const validTransaction = new Transaction(fixtures.ADD_TRANSACTION_PAYLOAD);
      expect(validTransaction).to.have.property('transactionId', 'BF75FCD3-9EF5-4C3F-B718-6C297A0A09DC');
      expect(validTransaction).to.have.property('betTransactionNumbers').length(2);
      expect(validTransaction.betTransactionNumbers).to.have.property(0, 'FO_0bb02fe98e7c1a1a1e15b978a887a56d');
      expect(validTransaction.betTransactionNumbers).to.have.property(1, 'PM_abf6c89cb30f7064b69a1793a7d7e64c');
    });
  });

  describe('static transfer', function () {
    it('should be a function', function () {
      expect(Transaction.transfer).to.be.a('function');
    });

    it('should throw an error when object is not Transaction class', function () {
      expect(() => Transaction.transfer({})).to.throw('Cannot transfer type object in Transaction');
    });

    it('should transfer BaseModel object', function () {
      const validTransaction = new Transaction(fixtures.ADD_TRANSACTION_PAYLOAD);
      const BaseModelTransferSpy = sandbox.spy(BaseModel, 'transfer');
      Transaction.transfer(validTransaction);
      sinon.assert.calledOnce(BaseModelTransferSpy);
      sinon.assert.calledWith(BaseModelTransferSpy, validTransaction);
    });

    it('should transfer to Kafka payload', function () {
      const validTransaction = new Transaction(fixtures.ADD_TRANSACTION_PAYLOAD);
      const transferred = Transaction.transfer(validTransaction);
      expect(transferred).to.be.an('object');
      expect(transferred).to.have.property('transactionId', 'BF75FCD3-9EF5-4C3F-B718-6C297A0A09DC');
      expect(transferred).to.have.property('serialNumbers').length(2);
      expect(transferred.serialNumbers).to.have.property(0, 'FO_0bb02fe98e7c1a1a1e15b978a887a56d');
      expect(transferred.serialNumbers).to.have.property(1, 'PM_abf6c89cb30f7064b69a1793a7d7e64c');
    });
  });
});
