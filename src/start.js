'use strict';

const async = require('async');
const pick = require('lodash/pick');
const pkg = require('../package.json');
const server = require('./server');
const env = require('./env');
const log = require('./log');
const kafkaClient = require('@tabdigital/kafka-client');
const nrconf = require('./newrelic');

log.info('New Relic launched and reporting as ' + nrconf.config.app_name);
const app = server.create();

process.on('uncaughtException', function (err) {
  const message = err.message || 'unknown error';
  log.error('Uncaught exception, shutting down the server: ' + message);
  log.error(err);
  process.exit(1);
});

process.on('SIGINT', function () {
  log.warn('SIGINT (Ctrl-C) received');
  process.exit(1);
});

process.on('SIGTERM', function () {
  log.warn('SIGTERM received');
  process.exit(1);
});

const kafkaConfig = env.config.kafkaClient;
const kafkaEnabled = kafkaConfig.enabled !== false;
if (kafkaEnabled) {
  log.info(pick(kafkaConfig, 'nodeEnv', 'kafkaRestProxyURL', 'schemaRegistryURL', 'schemaLocalRepoLifetime'),
    'Initialising Kafka client');
  kafkaClient.init({
    nodeEnv: kafkaConfig.nodeEnv,
    kafkaRestProxyURL: kafkaConfig.kafkaRestProxyURL,
    kafkaRestProxyUsername: kafkaConfig.kafkaRestProxyUsername,
    kafkaRestProxyPassword: kafkaConfig.kafkaRestProxyPassword,
    schemaRegistryURL: kafkaConfig.schemaRegistryURL,
    // schemaLocalRepoLifetime: ms(kafkaConfig.schemaLocalRepoLifetime),
    topicPrefix: kafkaConfig.topicPrefix,
    logger: log
  });
}

function ready(err) {
  if (err) {
    log.error('Failed to start: ' + err.message);
    process.exit(1);
  } else {
    log.info(`${pkg.name} listening at ${app.url}`);
  }
}

async.series([
  next => app.listen(env.config.serverPort, next),
  next => {
    if (kafkaEnabled) {
      // scheduler.start();
      next();
    }
  }
], ready);
