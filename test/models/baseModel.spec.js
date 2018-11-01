const strummer = require('strummer');
const BaseModel = require('src/models/baseModel');
const GeoLocation = require('src/models/geoLocation');
const fixtures = require('../fixtures');

describe('BaseModel', function () {
  describe('matcher', function () {
    it('should be a strummer matcher instance', function () {
      expect(BaseModel.matcher).to.be.an.instanceOf(strummer.Matcher);
    });
  });

  describe('fields', function () {
    it('should be a frozen list', function () {
      expect(BaseModel.fields).to.be.frozen;
      expect(BaseModel.fields).to.be.an.instanceOf(Array);
    });

    it('should contains 3 mandotary fields', function () {
      expect(BaseModel.fields).contains('accountId');
      expect(BaseModel.fields).contains('type');
      expect(BaseModel.fields).contains('geoLocation');
    });

    it('should contains 2 optional fields', function () {
      expect(BaseModel.fields).contains('dateTime');
      expect(BaseModel.fields).contains('brand');
    });
  });

  describe('constructor', function () {
    it('should throw error when invalid object', function () {
      expect(() => new BaseModel()).to.throw('Cannot parse BaseModel');
    });

    it('should parse the object', function () {
      const validBaseModel = new BaseModel(fixtures.BASE_PAYLOAD);
      expect(validBaseModel).to.have.property('accountId', 52211149);
      expect(validBaseModel).to.have.property('type', 'PLACE_BET');
      expect(validBaseModel).to.have.property('geoLocation').to.be.instanceOf(GeoLocation);
      expect(validBaseModel).to.have.property('dateTime').to.be.instanceOf(Date);
      expect(validBaseModel).to.have.property('brand', 'TAB');
    });
  });

  describe('static transfer', function () {
    it('should be a function', function () {
      expect(BaseModel.transfer).to.be.a('function');
    });

    it('should throw an error when object is not BaseModel class', function () {
      expect(() => BaseModel.transfer({})).to.throw('Cannot transfer type object in BaseModel');
    });

    it('should transfer GeoLocation object', function () {
      const validBaseModel = new BaseModel(fixtures.BASE_PAYLOAD);
      const GeoLocationTransferSpy = sinon.spy(GeoLocation, 'transfer');
      BaseModel.transfer(validBaseModel);
      sinon.assert.calledOnce(GeoLocationTransferSpy);
      sinon.assert.calledWith(GeoLocationTransferSpy, validBaseModel.geoLocation);
    });

    it('should transfer to Kafka payload', function () {
      const validBaseModel = new BaseModel(fixtures.BASE_PAYLOAD);
      const transferred = BaseModel.transfer(validBaseModel);
      expect(transferred).to.be.an('object');
      expect(transferred).to.have.property('accountNum', 52211149);
      expect(transferred).to.have.property('tranDateTime', 1528934380000);
      expect(transferred).to.have.property('brand', 2);
    });
  });
});
