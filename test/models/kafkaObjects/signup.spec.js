'use strict';
const Signup = require('src/models/kafkaObjects/signup');

const details = {
  accountNum: 52211149,
  tranDateTime: 1534385453430,
  geoUncertainty: 165,
  longitude: 153.03453880999993,
  latitude: -27.491640789999991,
  brand: 1
};

describe('Signup', () => {

  it('throws an error if the mandatory fields are not passed', () => {
    const expected = 'The following fields are missing: accountNum, tranDateTime, geoUncertainty, longitude, latitude, brand.';
    expect(() => new Signup({})).to.throw(expected);
  });

  describe('eventType', function () {
    it('should return signups', function () {
      const signup = new Signup(details);
      expect(signup.eventType).to.equal('signups');
    });
  });

  describe('asJSON', () => {
    it('returns a JSON representation of the event', () => {
      const signup = new Signup(details);

      const jsonBody = signup.asJSON().body;
      expect(jsonBody).to.deep.equal(details);
    });
  });

  describe('Matcher', () => {

    it('should return a valid Signup Kafaka Object when passed valid json', () => {
      const result = Signup.Matcher(details);
      expect(result[0]).to.be.empty;
      expect(result[1]).to.be.an.instanceof(Signup);
    });

    it('should return valid SignUP Kafka Object when passed valid  SignUp Object', () => {

      const signUp = new Signup(details);
      const result = Signup.Matcher(signUp);
      expect(result[0]).to.be.empty;
      expect(result[1]).to.be.an.instanceof(Signup);

    });

    it('should return error list and object type undefined when valid json is not passed', () => {

      const wrongDetails = {
        accountNum: 52211149,
        tranDateTime: 'WRONG DATE',
        geoUncertainty: 165,
        longitude: 153.03453880999993,
        latitude: -27.491640789999991,
        brand: 1

      };

      const result = Signup.Matcher(wrongDetails);
      expect(result[0]).to.have.lengthOf(1);
      expect(result[1]).to.be.an('undefined');

    });

    it('should return error list and object type undefined when valid json is not passed', () => {

      const wrongDetails = {
        accountNum: 'wrong account',
        tranDateTime: 'WRONG DATE',
        geoUncertainty: 165,
        longitude: 153.03453880999993,
        latitude: -27.491640789999991,
        brand: 1

      };

      const result = Signup.Matcher(wrongDetails);
      expect(result[0]).to.have.lengthOf(2);
      expect(result[1]).to.be.an('undefined');

    });

  });

  describe('fromJSON', () => {

    it('should return valid SignUp Kafka object when passed correct json obect', () => {

      const result = Signup.fromJSON(details);
      expect(result).to.be.an.instanceof(Signup);

    });

    it('should throw an error if invalid json object is passed',  () => {
      const wrongDetails = {
        accountNum: 'wrong account',
        tranDateTime: 'WRONG DATE',
        geoUncertainty: 165,
        longitude: 153.03453880999993,
        latitude: -27.491640789999991,
        brand: 1
      };

      expect(() => Signup.fromJSON(wrongDetails)).to.throw();

    });

  });

});
