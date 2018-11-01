/* eslint-disable no-process-env */
'use strict';
const fs = require('fs');
const jconfig = require('@tabdigital/json-config');
const pkg = require('../package');
const log = require('./log');
const configSchema = require('./config-schema');

// default to <local>
const name = 'Deployment';
log.info(`Starting ${pkg.name} on ${name}`);
if (!fs.existsSync(`configs/${name}`)) {
  throw new Error(`Cannot load environment ${name}`);
}

// load the appropriate config
const config = jconfig.load({
  path: `configs/${name}/config.json`,
  schema: process.env.IGNORE_CONFIG_SCHEMA === 'true' ? null : configSchema.CONFIG
});

// set the log level
log.setLevel(config.loglevel);

module.exports = {
  name,
  config,
  configDir: `configs/${name}`
};
