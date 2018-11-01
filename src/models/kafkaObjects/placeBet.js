'use strict';

/**
 * This is the kafka place bet model class
 */
const strummer = require('strummer');
const pick = require('lodash/pick');
const KafkaObject = require('./kafkaObject');
const hashValidator = require('../../utils/hash');

const PlaceBetMatcherFields = Object.freeze({
  accountNum: new strummer.integer({ parse: true, min: 1, max: Number.MAX_SAFE_INTEGER }),
  tranDateTime: 'integer',
  geoUncertainty: 'integer',
  longitude: 'number',
  latitude: 'number',
  transactionId: 'string',
  brand: 'integer',
  serialNumbers: new strummer.array({ of: 'string', optional: true }),
});

const PlaceBetMatcher = new strummer.objectWithOnly(PlaceBetMatcherFields);

const MANDATORY_FIELDS = Object.keys(PlaceBetMatcherFields).filter(k => !PlaceBetMatcherFields[k].optional);

/**
 * Class representing a PlaceBet object
 * @extends KafkaObject
 */
class PlaceBet extends KafkaObject {
  /**
   * @constructor Constructor of PlaceBet class
   * @param {object} details - The details contains accountNum, tranDateTime, transactionId,
   * flattened geo-location information, and brand.
   */
  constructor(details) {
    super();
    hashValidator.checkContains(details, MANDATORY_FIELDS);
    this.eventType = 'bets';
    this.body = pick(details, Object.keys(PlaceBetMatcherFields));
  }

  /**
   * Matcher to validate the given object is a PlaceBet object.
   * @static Matcher
   * @param {PlaceBet?} mayPlaceBetObject object may be
   * @returns {[[error?], PlaceBet?]} Tuple of two elements.
   * First element is the error list of validation.
   * Second element is an instance of PlaceBet object if the given object is already an instance or
   * it passed the validate rules.
   */
  static Matcher(mayPlaceBetObject) {
    let errors = [];
    if (mayPlaceBetObject instanceof PlaceBet) {
      return [errors, mayPlaceBetObject];
    }
    errors = PlaceBetMatcher.match(mayPlaceBetObject);
    if (errors.length > 0) {
      return [errors, undefined];
    }
    return [errors, new PlaceBet(mayPlaceBetObject)];
  }

  /**
   * produce a valid PlaceBet Kafka Object when valid JSON object is provided
   * @throws Error if the PlaceBet Object could not be created.

   * @param jsonObject Json data Object which conforms to PlaceBet Object Message Schema.
   * @returns PlaceBet Object
   */
  static fromJSON(jsonObject) {
    const [errors, result] = this.Matcher(jsonObject);
    if (errors.length > 0) {
      throw new Error('Error could not create kafka object, one (or more) error');
    }
    return result;
  }
}

module.exports = PlaceBet;
