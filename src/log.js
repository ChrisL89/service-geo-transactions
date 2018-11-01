'use strict';

const APILogger = require('@tabdigital/api-logger');
const pkg = require('../package.json');

module.exports = new APILogger({
  level: 'info',
  name: pkg.name
});
