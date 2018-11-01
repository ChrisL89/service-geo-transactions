#!/usr/bin/env node

'use strict';
const secrets = require('@tabdigital/s3-secrets');
const pkg = require('../package');
const log = require('../src/log');
const chalk = require('chalk');

secrets.load({
  service: pkg.name,
  env: process.env.APP_ENV,
  skip: ['Dev','devSeed']
}, function (err, response) {
  
  const config = require('../src/env').config;
  const dbSetup = require('@tabdigital/db-setup');

  log.info(response.message);

  const geotransactionsConfig = config.databases.geotransactions;
  console.info(chalk.green(`Running migrations for environment: ${process.env.APP_ENV}`));
  dbSetup.migrate(geotransactionsConfig, `${__dirname}/..`, 'up', null, migrateUpError => {
    if (migrateUpError) {
      console.error(chalk.red('Could not apply migrations!!!'));
      console.error(chalk.red(migrateUpError.message));
      process.exit(1);
    }
    return;
  });
});