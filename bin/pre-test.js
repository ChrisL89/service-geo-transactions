'use strict';
const chalk = require('chalk');
const dbSetup = require('@tabdigital/db-setup');
const config = require('../src/env').config;
const env = require('../src/env');

const {geotransactions, postgres} = config.databases;

console.info(chalk.green(`Creating data base for environment: ${env.name}`));
dbSetup.setupDatabaseAndUser(geotransactions, postgres, ['postgis'], dbCreationErr => {
  if (dbCreationErr) {
    console.error(chalk.red('Could not create the test data base!!!'));
    console.error(chalk.red(dbCreationErr.message));
    process.exit(1);
  }
  console.info(chalk.green(`Running migrations for environment: ${env.name}`));
  dbSetup.migrate(geotransactions, './', 'up', null, error => {
    if (error) {
      console.error(chalk.red('Could not apply migrations!!!'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
});