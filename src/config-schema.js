'use strict';

const strummer = require('strummer');


const dbSchema = strummer.object({
  user: strummer.string(),
  password: strummer.string(),
  database: strummer.string(),
  host: strummer.string(),
  port: strummer.integer({parse: true}),
  debug: strummer.boolean({optional: true})
});



const CONFIG = new strummer.object({
  loglevel: strummer.string(),
  publicURL: strummer.string(),
  serverPort: strummer.number({parse: true}),
  logfile: strummer.string({optional: true}),
  showStackTrace: strummer.boolean(),
  enableTransactionDebugging: strummer.boolean({parse:true}),
  kafkaClient: strummer({
    enabled: strummer.boolean(),
    nodeEnv: strummer.string({optional: true}),
    kafkaRestProxyURL: strummer.url(),
    kafkaRestProxyUsername: strummer.string({optional: true}),
    kafkaRestProxyPassword: strummer.string({optional: true}),
    schemaRegistryURL: strummer.string(),
    schemaLocalRepoLifetime: strummer.duration(),
    topicPrefix: strummer.string({optional: true})
  }),
  databases: strummer.object({
    postgres: dbSchema,
    geotransactions: dbSchema
  })
});

module.exports = {
  CONFIG
};
