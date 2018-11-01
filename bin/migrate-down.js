#!/usr/bin/env node

'use strict';
const secrets = require('@tabdigital/s3-secrets');
const pkg = require('../package');
const log = require('../src/log');
const chalk = require('chalk');

if (process.argv.length !== 3) {
  console.error(chalk.red('USAGE: npm run-script migrate-down <number of migrations you want to migrate down>'));
  process.exit(1);
}

secrets.load({
  service: pkg.name,
  env: process.env.APP_ENV,
  skip: ['Dev','devSeed']
}, function (err, response) {

  const config = require('../src/env').config;
  const dbSetup = require('@tabdigital/db-setup');

  log.info(response.message);

  const geotransactionsConfig = config.databases.geotransactions;

  const count = parseInt(process.argv[2], 10);
  console.info(chalk.green(`Running migrations for environment: ${process.env.APP_ENV}`));
  dbSetup.migrate(geotransactionsConfig, `${__dirname}/..`, 'down', count, migrateDownError => {
    if (migrateDownError) {
      console.error(chalk.red('Could not drop migrations!!!'));
      console.error(chalk.red(migrateDownError.message));
      process.exit(1);
    }
  });
});