const KafkaObject = require('src/models/kafkaObjects/kafkaObject');

describe('KafkaObject', function () {
  it('should assign default messageId when constructed', function () {
    const kafkaObj = new KafkaObject();
    expect(kafkaObj.messageId).to.be.a('string');
  });

  describe('eventType', function () {
    it('should throw error when eventType is not assigned', function () {
      const kafkaObj = new KafkaObject();
      expect(() => kafkaObj.eventType).to.throw();
    });

    it('should return set value after assigned', function () {
      const kafkaObj = new KafkaObject();
      const expectedEventType = 'expectedEventType';
      kafkaObj.eventType = expectedEventType;
      expect(kafkaObj.eventType).to.equal(expectedEventType);
    });

    it('cannot set twice', function () {
      const kafkaObj = new KafkaObject();
      const expectedEventType = 'expectedEventType';
      kafkaObj.eventType = expectedEventType;
      expect(() => { kafkaObj.eventType = 'boom'; }).to.throw();
    });
  });

  describe('static Matcher', function () {
    it('should be a not implemented interface', function () {
      expect(KafkaObject.Matcher).to.throw();
    });
  });

  describe('static fromJSON', function () {
    it('should be a not implemented interface', function () {
      expect(KafkaObject.fromJSON).to.throw();
    });
  });

  describe('asJSON', function () {
    it('should return an object with header and undefined body by default', function () {
      const kafkaObj = new KafkaObject();
      const asJSON = kafkaObj.asJSON();
      expect(asJSON).property('header').to.be.an('object');
      expect(asJSON).property('body').to.be.undefined;
    });

    it('should return an object with body after assigned', function () {
      const kafkaObj = new KafkaObject();
      const expectedBody = { key: 'expected' };
      kafkaObj.body = expectedBody;
      expect(kafkaObj.asJSON()).property('body').to.deep.equal(expectedBody);
    });
  });
});
