'use strict';

const fs = require('fs');
const apiRouter = require('@tabdigital/connect-router');
const components = require('./components');
const swagger = require('./swagger');
const env = require('./env');

function routerOptions() {
  if (!fs.existsSync(env.config.jwtSignPublicKeyPath)) {
    return {};
  }
  return {jwtPublicKeyPath: env.config.jwtSignPublicKeyPath};
}

const create = server => {
  const router = apiRouter(routerOptions());
  registerDiscovery(router);
  registerSwaggerRoutes(router);
  components.register(router, server);
  return router;
};

function registerSwaggerRoutes(router) {
  router.get({
    name: 'swagger-json',
    path: '/swagger.json',
    handlers: [(req, res) => res.send(toSwagger())],
  });
}

function registerDiscovery(router) {
  router.get({
    name: 'discovery',
    path: '/v1/geo-transactions',
    cache: 60,
    handlers: [(req, res, next) => {
      const body = {
        _links: {
          'geo-transactions:add': `${env.config.publicURL}/v1/geo-transactions/add`,
          'geo-transactions:account-sign-up': `${env.config.publicURL}/v1/geo-transactions/account-sign-up`,
          'geo-transactions:get-geotransaction-history': `${env.config.publicURL}/v1/geo-transactions/get-geotransaction-history`,
          'geo-transactions:status': `${env.config.publicURL}/v1/geo-transactions/status`,
          'geo-transactions:status-details': `${env.config.publicURL}/v1/geo-transactions/status/details`,
        }
      };
      res.send(body);
      next();
    }],
  });
}

function toSwagger() {
  const router = apiRouter();
  registerDiscovery(router);
  components.register(router);
  return router.toSwagger(swagger.info);
}

module.exports = {
  create,
  toSwagger,
};
