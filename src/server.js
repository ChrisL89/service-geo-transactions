'use strict';

const restify = require('restify');
const apiMiddleware = require('@tabdigital/api-middleware');
const pkg = require('../package');
const router = require('./router');
const config = require('./env').config;
const log = require('./log');
const ApiError = require('./utils/apiError');

exports.create = function () {
  const server = restify.createServer({
    name: pkg.name,
    version: pkg.version,
    formatters: {
      'application/json': function (req, res, body) {
        if (body.error && !config.showStackTrace) {
          delete body.error.stack;
        }
        return JSON.stringify(body);
      },
    },
  });

  server.on('uncaughtException', (req, res, route, err) => {
    log.error(`geo-transaction:uncaught-exception:error:${String(err)}`);
    if (res._header) { // eslint-disable-line no-underscore-dangle
      res.end();
    } else {
      res.send(503, new restify.InternalError('Service not available'));
    }
  });

  server.pre(restify.pre.sanitizePath());
  server.use(restify.plugins.fullResponse());
  server.use(restify.plugins.gzipResponse());
  server.use(restify.plugins.bodyParser({mapParams: false}));
  server.use(restify.plugins.queryParser({mapParams: false}));
  server.use(apiMiddleware.plainTextParser());
  server.use(apiMiddleware.cache({ defaultMaxAge: 0 }));
  server.use(apiMiddleware.hypermedia(server.router, config.publicURL));
  server.on('BadRequest', function (req, res, err, next) {
    res.send(400, {
      error: new ApiError({
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.fields.details,
      }),
    });
    next();
  });

  router.create(server).mountRestify(server);
  return server;
};
