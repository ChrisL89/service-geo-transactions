const uuid = require('uuid/v4');
const log = require('../../log');

/**
 * Represent the class for Kafka Object Models
 *
 * @class
 */
class KafkaObject {
  /**
   * KafkaObject constructor will setup a message by default if doesn't get any
   */
  constructor() {
    this.messageId = uuid();
  }

  /**
   * eventType setter to make event type be set once
   * @param {String} type event type be assigned in Kafka Object
   */
  set eventType(type) {
    Object.defineProperty(this, 'eventType', {
      set: () => {
        throw new Error('Cannot set eventType twice');
      },
      get: () => type,
    });
  }

  /**
   * eventType getter
   * @returns {String} event type after set up in constructor
   */
  get eventType() {
    log.error('KafkaObject:eventType:NotExisted');
    throw new Error('KafkaObject doesn\'t have eventType. Please assign eventType in your constructor');
  }

  /**
   * Validate the given object to this kafka object schema
   * @interface
   * @returns {[Array<Error>, Any]} Tuple.
   * The first element is a list of errors of unmatched and the second element is the parsed result of matched.
   * The first element is empty list when no unmatched error.
   * The second element is undefined when no value is parsed.
   */
  static Matcher(/* mightBeKafkaObject */) {
    log.error('KafkaObject:Matcher:HasBeenCalled');
    throw new Error('KafkaObject matcher should not be called.');
  }

  /**
   * fromJSON not implemented
   * @interface
   * @returns {Object<KafkaObject>} The Kafka object transfer from given data object
   */
  static fromJSON(/* dataObject */) {
    log.error('KafkaObject:fromJSON:HasBeenCalled');
    throw new Error('KafkaObject fromJSON should not be called.');
  }

  /**
   * Convert Kafka Object to Kafka Request Object
   * @returns {Object<KafkaRequest>}
   */
  asJSON() {
    return {
      header: {
        messageId: this.messageId,
        application: 'geotransactions',
        timestamp: new Date().getTime(),
      },
      body: this.body,
    };
  }


}

module.exports = KafkaObject;
