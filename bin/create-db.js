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

  // log whether it was successful
  log.info(response.message);
  // process.env now contains all secrets
  // they are only accessible from within this Node process
  const {geotransactions, postgres} = config.databases;
  
  console.info(chalk.green(`Creating data base for environment: ${process.env.APP_ENV || 'DEV'}`));
  dbSetup.setupDatabaseAndUser(geotransactions, postgres, ['postgis'], dbCreationErr => {
    if (dbCreationErr) {
      console.error(chalk.red('Could not create the data base!!!'));
      console.error(chalk.red(dbCreationErr.message));
      process.exit(1);
    }
    return;
  });
});