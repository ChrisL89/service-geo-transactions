/**
 * Class to initialize bookshelf global object
 */
const config = require('../env').config;
const dbConfig = config.databases.geotransactions;


const knex = require('knex')({
  client: 'pg',
  connection: {
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    host: dbConfig.host,
    port: dbConfig.port
  },
  debug: dbConfig.debug,
});

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;


