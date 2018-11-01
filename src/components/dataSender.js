'use strict';

const kafkaClient = require('@tabdigital/kafka-client');
const log = require('../log');

const sendObject = (dataObject, callback) => {
  kafkaClient.schemaRepository.getSchemaEntityByTopic(getTopic(dataObject), function (error, schemaEntity) {
    if (error) {
      log.error(error, 'geo-transactions:kafka-transfer:get-topic:error', dataObject.asJSON());
      callback(error);
      return;
    }
    transferObject(dataObject, schemaEntity, callback);
  });
};

const transferObject = (dataObject, schemaEntity, callback) => {

  const topic1 = 'yarra_au.digital.source.geotransactions.signups.avro';
  const schemaEntityString1 = '{"id":1293,"topic":"yarra_au.digital.source.geotransactions.signups.avro-value","schema":{"type":"record","name":"signupsSchema","namespace":"au.digital.source.geotransactions","fields":[{"name":"header","type":{"type":"record","name":"Header","fields":[{"name":"messageId","type":"string","doc":"the unique id for each message"},{"name":"timestamp","type":"long","doc":"the timestamp of message be generated. UTC+0 millisecond"},{"name":"application","type":"string","doc":"the source application where message delivered from"}]}},{"name":"body","type":{"type":"record","name":"Body","fields":[{"name":"accountNum","type":"long","doc":"account number of customer placing the bet"},{"name":"tranDateTime","type":"long","doc":"time the transaction was placed. Epoch Millisecond format"},{"name":"brand","type":"int","doc":"identified brand. 1=UBET, 2=TAB"},{"name":"latitude","type":"double"},{"name":"longitude","type":"double"},{"name":"geoUncertainty","type":"long"}]}}]},"version":1}';
  const dataObjectString1 = '{"header":{"messageId":"0e9afbf6-9124-4c58-b276-bd4063b4cc64","application":"geotransactions","timestamp":1539667606943},"body":{"accountNum":1000,"tranDateTime":1535593200000,"geoUncertainty":25,"longitude":153.0349983,"latitude":-27.4911983,"brand":1}}';

  kafkaClient.kafkaRestProxyService.produce(topic1, JSON.parse(schemaEntityString1), JSON.parse(dataObjectString1), error => {
    log.info(`topic1: ${topic1} , schemaEntity1: ${schemaEntityString1} , dataObject1: ${dataObjectString1} `);
    if (error) {
      log.error(error, 'api-service-alert-publisher:kafka-transfer:send-event:error', dataObject.asJSON());
      callback(error);
      return;
    }
    callback();
  });

  const topic2 = 'yarra_au.digital.source.monitoring_alert.MonitoringAlert.avro';
  const schemaEntityString2 = '{"id":1314,"topic":"yarra_au.digital.source.monitoring_alert.MonitoringAlert.avro-value","schema":{"type":"record","name":"MonitoringAlertSchema","namespace":"au.digital.source.monitoring-alert","fields":[{"name":"header","type":{"type":"record","name":"Header","fields":[{"name":"messageId","type":"string","doc":"the unique id for each message"},{"name":"timestamp","type":"long","doc":"the timestamp of message be generated. UTC+0 millisecond"},{"name":"application","type":"string","doc":"the source application where message delivered from"}]}},{"name":"body","type":{"type":"record","name":"Body","fields":[{"name":"type","type":"string","doc":"The change type that generated this record.nValues:n  1: Critical - Critical alert message that need immediate attentionn  2: Warning - Warning alert message that need attention soonn  3: Info - Info level alert message that need to be loggedn"},{"name":"message","type":"string","doc":"Description of the alert"},{"name":"component","type":"string","doc":"Which component that fired off the alert"},{"name":"alertCode","type":"string","doc":""},{"name":"timestamp","type":"long","doc":"time the alert was created"},{"name":"venueId","type":"string","doc":"terminal venue id"},{"name":"terminalId","type":"string","doc":"terminal id"},{"name":"deviceId","type":"string","doc":"terminal device id"},{"name":"deviceType","type":"string","doc":"terminal device type"},{"name":"wageringId","type":"string","doc":"terminal wagering id"}]}}]},"version":1}';
  const dataObjectString2 = '{"header":{"messageId":"c2ee8baf-51bd-4a8e-b7c5-f4bc02ae768b","application":"monitoring-alert","timestamp":1539665976629},"body":{"type":"Critical","message":"$1000 AML threshhold has been triggered by customer:DWR-1557","component":"AML","alertCode":"C001","timestamp":1535593209000,"venueId":"25","terminalId":"88","deviceId":"4","deviceType":"EBT","wageringId":"3330F484-3C0A-4459-965C-A810B8AFA646"}}';

  kafkaClient.kafkaRestProxyService.produce(topic2, JSON.parse(schemaEntityString2), JSON.parse(dataObjectString2), error => {
    log.info(`topic2: ${topic2} , schemaEntity2: ${schemaEntityString2} , dataObject2: ${dataObjectString2} `);
    if (error) {
      log.error(error, 'api-service-alert-publisher:kafka-transfer:send-event:error', dataObject.asJSON());
      callback(error);
      return;
    }
    callback();
  });


/*  kafkaClient.kafkaRestProxyService.produce(getTopic(dataObject), schemaEntity, dataObject.asJSON(), error => {
    log.info(`topic: ${JSON.stringify(getTopic(dataObject))} , schemaEntity: ${JSON.stringify(schemaEntity)} , dataObject: ${JSON.stringify(dataObject.asJSON())} `);
    if (error) {
      log.error(error, 'geo-transactions:kafka-transfer:send-event:error', dataObject.asJSON());
      callback(error);
      return;
    }
    log.info('Successfully transfered object to kafka', 'geo-transactions:kafka-transfer:send-event:success', dataObject.asJSON());
    callback();
  });*/
};

const getTopic = dataObject => {
  const EventEntity = kafkaClient.EventEntity;
  const event = new EventEntity(dataObject.eventType, dataObject.eventType, 'geotransactions');
  return event.topic;
};

module.exports = {
  sendObject,
};
