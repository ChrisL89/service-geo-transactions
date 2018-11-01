'use strict';
const PlaceBet = require('src/models/kafkaObjects/placeBet');

const details = {
  accountNum: 52211149,
  tranDateTime: 1534385453430,
  geoUncertainty: 165,
  longitude: 153.03453880999993,
  latitude: -27.491640789999991,
  transactionId: 'BF75FCD3-9EF5-4C3F-B718-6C297A0A09DC',
  serialNumbers: ['1010765635', '1949684478'],
  brand: 1
};

describe('PlaceBet', () => {

  it('throws an error if the mandatory fields are not passed', () => {
    const expected = 'The following fields are missing: accountNum, tranDateTime, geoUncertainty, longitude, latitude, transactionId, brand.';
    expect(() => new PlaceBet({})).to.throw(expected);
  });

  describe('eventType', function () {
    it('should return bets', function () {
      const bet = new PlaceBet(details);
      expect(bet.eventType).to.equal('bets');
    });
  });

  describe('asJSON', () => {
    it('returns a JSON representation of the event', () => {
      const bet = new PlaceBet(details);

      const jsonBody = bet.asJSON().body;
      expect(jsonBody).have.to.deep.equal(details);
    });
  });

  describe('Matcher', function () {
    it('should return an empty error list and a valid PlaceBet Kafka Object when passed the validation', function () {
      const [errors, result] = PlaceBet.Matcher(details);
      expect(errors).to.be.empty;
      expect(result).to.be.an.instanceof(PlaceBet);
    });

    it('should return an empty error list and the instance when given a PlaceBet instance', function () {
      const bet = new PlaceBet(details);
      const [errors, result] = PlaceBet.Matcher(bet);
      expect(errors).to.be.empty;
      expect(result).to.equal(bet);
    });

    it('should return one error in list when given one invalid data', function () {
      const [errors, result] = PlaceBet.Matcher(Object.assign({}, details, {
        accountNum: 'WRONG ACCOUNT NUM',
      }));
      expect(errors).length(1);
      expect(result).to.be.undefined;
    });

    it('should return 2 errors in list when given two invalid data', function () {
      const [errors, result] = PlaceBet.Matcher(Object.assign({}, details, {
        accountNum: 'WRONG ACCOUNT NUM',
        tranDateTime: 'WRONG TRAN DATE TIME',
      }));
      expect(errors).length(2);
      expect(result).to.be.undefined;
    });
  });

  describe('fromJSON', function () {
    it('should throw error if given JSON object is invalid', function () {
      expect(() => PlaceBet.fromJSON(Object.assign({}, details, {
        accountNum: 'WRONG ACCOUNT NUM',
      }))).to.throw();
    });

    it('should return a PlaceBet instance if given JSON object is valid', function (){
      const bet = PlaceBet.fromJSON(details);
      expect(bet).to.be.instanceof(PlaceBet);
    });
  });
});
