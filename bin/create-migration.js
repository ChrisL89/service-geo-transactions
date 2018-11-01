'use strict';
const chalk = require('chalk');
const fs = require('fs');
const _ = require('lodash');
const config = require('../src/env').config;
const databaseConfigFilePath = `${__dirname}/../database.json`;

if (process.argv.length !== 3) {
  console.error(chalk.red('USAGE: npm run-script create-migration <migration-name-with-no-spaces>'));
  process.exit(1);
}

if (!fs.existsSync(databaseConfigFilePath)) {
  console.info(chalk.green('Creating database.json which is required by db setup to create a migration'));
  const dataBaseConfig = JSON.stringify({
    dev: _.extend(
      {driver: 'pg'},
      config.databases.invenueAML
    )
  });
  fs.writeFileSync(databaseConfigFilePath, dataBaseConfig);
} else {
  console.info(chalk.green('Not creating database.json since it exists.'));
}

const dbMigrateArgs = [
  process.argv[0],
  'db-migrate',
  'create',
  process.argv[2],
  '--sql-file'
];

process.argv = dbMigrateArgs;
require(`${__dirname}/../node_modules/db-migrate/bin/db-migrate`);
