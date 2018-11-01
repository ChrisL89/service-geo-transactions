const strummer = require('strummer');
const mapValues = require('lodash/mapValues');
const pick = require('lodash/pick');

const GeoLocationMatcherFields = Object.freeze({
  latitude: new strummer.number({ min: -90, max: 90, parse: true }),
  longitude: new strummer.number({ min: -180, max: 180, parse: true }),
  uncertainty: new strummer.integer({ parse: true }),
});

const GeoLocationMatcher = new strummer.objectWithOnly(GeoLocationMatcherFields);
const GeoLocationFields = Object.freeze(Object.keys(GeoLocationMatcherFields));

class GeoLocation {
  constructor(obj) {
    const unmatchedList = GeoLocationMatcher.match(obj);
    if (unmatchedList.length > 0) {
      throw new Error('Cannot parse GeoLocation');
    }
    const parsedMandotaryFields = mapValues(pick(obj, GeoLocationFields), Number.parseFloat);
    Object.assign(this, parsedMandotaryFields);
  }

  static transfer(geoLocation) {
    if (!(geoLocation instanceof GeoLocation)) {
      throw new Error(`Cannot transfer type ${typeof geoLocation} in GeoLocation`);
    }
    return Object.assign({}, {
      longitude: geoLocation.longitude,
      latitude: geoLocation.latitude,
      geoUncertainty: geoLocation.uncertainty,
    });
  }
}

GeoLocation.matcher = GeoLocationMatcher;
GeoLocation.fields = GeoLocationFields;

module.exports = GeoLocation;
