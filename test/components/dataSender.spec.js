'use strict';

const sinon = require('sinon');
const kafkaClient = require('@tabdigital/kafka-client');
const dataSender = require('src/components/dataSender');
const log = require('src/log');

describe('dataSender', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendObject', () => {

    let dataObject;

    before(() => {
      kafkaClient.init({nodeEnv: 'dev'});
    });

    beforeEach(() => {
      sandbox.stub(kafkaClient.schemaRepository, 'getSchemaEntityByTopic');
      sandbox.stub(kafkaClient.kafkaRestProxyService, 'produce');
      sandbox.stub(log, 'info');
      sandbox.stub(log, 'error');

      dataObject = {
        asJSON: () => 'eventJSON',
        eventType: 'testEventType'
      };
    });

    it('should send objects to the Kafka rest proxy', () => {
      kafkaClient.schemaRepository.getSchemaEntityByTopic.yields(false, 'schema_entity');
      kafkaClient.kafkaRestProxyService.produce.yields(false);

      dataSender.sendObject(dataObject, () => {
        sinon.assert.calledWith(kafkaClient.schemaRepository.getSchemaEntityByTopic, 'au.digital.source.geotransactions.testEventType.avro');
        sinon.assert.calledWith(kafkaClient.kafkaRestProxyService.produce, 'au.digital.source.geotransactions.testEventType.avro', 'schema_entity', 'eventJSON');
        sinon.assert.calledWith(log.info, 'Successfully transfered object to kafka', 'geo-transactions:kafka-transfer:send-event:success', 'eventJSON');
        sinon.assert.notCalled(log.error);
      });
    });

    it('should log an error if getSchemaEntityByTopic returns an error', () => {
      kafkaClient.schemaRepository.getSchemaEntityByTopic.yields('schema_error');

      dataSender.sendObject(dataObject, () => {
        sinon.assert.calledWith(log.error, 'schema_error', 'geo-transactions:kafka-transfer:get-topic:error', 'eventJSON');
        sinon.assert.notCalled(log.info);
        sinon.assert.notCalled(kafkaClient.kafkaRestProxyService.produce);
      });
    });

    it('should log an error if produce returns an error', () => {
      kafkaClient.schemaRepository.getSchemaEntityByTopic.yields(false, 'schema_entity');
      kafkaClient.kafkaRestProxyService.produce.yields('produce_error');

      dataSender.sendObject(dataObject, () => {
        sinon.assert.calledWith(kafkaClient.schemaRepository.getSchemaEntityByTopic, 'au.digital.source.geotransactions.testEventType.avro');
        sinon.assert.calledWith(kafkaClient.kafkaRestProxyService.produce, 'au.digital.source.geotransactions.testEventType.avro', 'schema_entity', 'eventJSON');
        sinon.assert.calledWith(log.error, 'produce_error', 'geo-transactions:kafka-transfer:send-event:error', 'eventJSON');
        sinon.assert.notCalled(log.info);
      });
    });
  });
});
