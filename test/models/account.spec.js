const strummer = require('strummer');
const BaseModel = require('src/models/baseModel');
const Account = require('src/models/account');
const fixtures = require('../fixtures');

describe('Account', function () {
  const sandbox = sinon.createSandbox();

  afterEach(function () {
    sandbox.restore();
  });

  describe('matcher', function () {
    it('should be a strummer matcher instance', function () {
      expect(Account.matcher).to.be.an.instanceOf(strummer.Matcher);
    });
  });

  describe('fields', function () {
    it('should be a frozen list', function () {
      expect(Account.fields).to.be.frozen;
      expect(Account.fields).to.be.an.instanceOf(Array);
    });
  });

  describe('constructor', function () {
    it('should throw error when invalid object', function () {
      expect(() => new Account()).to.throw('Cannot parse BaseModel, Account');
    });

    it('should extended from BaseModel', function () {
      const validTransaction = new Account(fixtures.ACCOUNT_PAYLOAD);
      expect(validTransaction).to.be.instanceOf(BaseModel);
      expect(validTransaction).to.be.instanceOf(Account);
    });
  });

  describe('static transfer', function () {
    it('should be a function', function () {
      expect(Account.transfer).to.be.a('function');
    });

    it('should throw an error when object is not Account class', function () {
      expect(() => Account.transfer({})).to.throw('Cannot transfer type object in Account');
    });

    it('should transfer BaseModel object', function () {
      const validAccount = new Account(fixtures.ACCOUNT_PAYLOAD);
      const BaseModelTransferSpy = sandbox.spy(BaseModel, 'transfer');
      Account.transfer(validAccount);
      sinon.assert.calledOnce(BaseModelTransferSpy);
      sinon.assert.calledWith(BaseModelTransferSpy, validAccount);
    });

    it('should transfer to Kafka payload', function () {
      const validAccount = new Account(fixtures.ACCOUNT_PAYLOAD);
      const transferred = Account.transfer(validAccount);
      expect(transferred).to.be.an('object');
    });
  });
});
