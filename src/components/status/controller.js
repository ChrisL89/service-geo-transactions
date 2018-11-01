const _ = require('lodash');
const os = require('os');
const packageJSON = require('../../../package.json');
const env = require('../../env');

function get(req, res, next) {
  res.send(200, {code: 200, 
    _links: {details: `${env.config.publicURL}/v1/geo-transactions/status/details`}});
  next();
}

function details(req, res, next) {
  res.send(200, {
    hostname: getHostname(),
    components: getComponents()
  });
  next();
}

function getHostname() {
  return _.first(os.hostname().split('.'));
}

function getComponents() {
  const components = {};
  const version = packageJSON.version + ':' + (process.env.RELEASE_VERSION ? process.env.RELEASE_VERSION : 'UNKNOWN_RELEASE_VERSION');
  components[packageJSON.name] = version;
  return components;
}

module.exports = {
  get,
  details,
};
