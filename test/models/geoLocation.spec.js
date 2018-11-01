const strummer = require('strummer');
const GeoLocation = require('src/models/geoLocation');
const fixtures = require('../fixtures');

describe('GeoLocation', function () {
  describe('matcher', function () {
    it('should be a strummer Matcher instance', function () {
      expect(GeoLocation.matcher).to.be.an.instanceOf(strummer.Matcher);
    });
  });

  describe('mandotary fields', function () {
    it('should be a frozen list', function () {
      expect(GeoLocation.fields).to.be.frozen;
      expect(GeoLocation.fields).to.be.an.instanceOf(Array);
    });

    it('should include 3 fields', function () {
      expect(GeoLocation.fields).length(3);
      expect(GeoLocation.fields).to.include('latitude');
      expect(GeoLocation.fields).to.include('longitude');
      expect(GeoLocation.fields).to.include('uncertainty');
    });
  });

  describe('constructor', function () {
    it('should throw error when invalid object', function () {
      expect(() => new GeoLocation()).to.throw('Cannot parse GeoLocation');
    });

    it('should parse the object', function () {
      const validGeoLocation = new GeoLocation(fixtures.GEO_LOCATION_PAYLOAD);
      expect(validGeoLocation).to.have.property('latitude', -27.491640789999991);
      expect(validGeoLocation).to.have.property('longitude', 153.03453880999993);
      expect(validGeoLocation).to.have.property('uncertainty', 165);
    });
  });

  describe('static transfer', function () {
    it('should be a function', function () {
      expect(GeoLocation.transfer).to.be.a('function');
    });

    it('should throw an error when object is not GeoLocation class', function () {
      expect(() => GeoLocation.transfer({})).to.throw('Cannot transfer type object in GeoLocation');
    });

    it('should transfer to Kafka payload', function () {
      const validGeoLocation = new GeoLocation(fixtures.GEO_LOCATION_PAYLOAD);
      const transferred = GeoLocation.transfer(validGeoLocation);
      expect(transferred).to.be.an('object');
      expect(transferred).to.have.property('latitude', -27.491640789999991);
      expect(transferred).to.have.property('longitude', 153.03453880999993);
      expect(transferred).to.have.property('geoUncertainty', 165);
    });
  });
});
