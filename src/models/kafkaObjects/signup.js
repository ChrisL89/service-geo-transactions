'use strict';

/**
 * This is the kafka sign up model class
 */
const strummer = require('strummer');
const pick = require('lodash/pick');
const KafkaObject = require('./kafkaObject');
const hashValidator = require('../../utils/hash');


const SignupMatcherFields = Object.freeze({
  accountNum: new strummer.integer({ parse: true, min: 1, max: Number.MAX_SAFE_INTEGER }),
  tranDateTime: 'integer',
  geoUncertainty: 'integer',
  longitude: 'number',
  latitude: 'number',
  brand: 'integer',
});

const SignupMatcher = new strummer.object(SignupMatcherFields);

const MANDATORY_FIELDS = [
  'accountNum',
  'tranDateTime',
  'geoUncertainty',
  'longitude',
  'latitude',
  'brand'
];

/**
 * Class representing a Signup object
 * @extends KafkaObject
 */
class Signup extends KafkaObject {
  /**
   * Create a Signup object
   * @param {object} details - Signup details includes fields acccountNum, tranDateTime, brand, and
   * flattened geo-location object
   */
  constructor(details) {
    super();
    hashValidator.checkContains(details, MANDATORY_FIELDS);
    this.eventType = 'signups';
    this.body = pick(details, MANDATORY_FIELDS);
  }

  /**
   * Validate the given object to this kafka object schema if valid return a valid SignUp Kafka Object,
   * @static Matcher
   *
   * @param {maySignupObject?} could be SignUp Object or an JSON Object which conforms to the SignUp Object Schema.
   *
   * @returns [[error], SignupObject]  return tuple of two elements
   * first element is the error list , if the validation fails.
   * second element is an instance of SignupObject if the validation passes.
   * @constructor
   */
  static Matcher(maySignupObject) {
    let errors = [];

    if (maySignupObject instanceof Signup) {
      return [errors, maySignupObject];
    } else {

      errors = SignupMatcher.match(maySignupObject);
      return (errors.length === 0) ? [errors, new Signup(maySignupObject)] : [errors, undefined];
    }
  }

  /**
   * produce a valid SignUp Kafka Object when valid JSON object is provided
   * @throws Error if the Signup Object could not be created.

   * @param jsonObject Json data Object which conforms to SignUp Object Message Schema.
   * @returns Signup Object
   */
  static fromJSON(jsonObject) {

    const [errors, result] = this.Matcher(jsonObject);

    if (errors.length > 0) {
      throw new Error('Error could not create kafka object, one (or more) error');
    }
    return result;
  }

}

module.exports = Signup;
