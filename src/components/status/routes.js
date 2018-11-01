const controller = require('./controller');

function register(apiRouter) {
  apiRouter.get({
    name: 'status',
    path: '/v1/geo-transactions/status',
    handlers: [controller.get]
  });

  apiRouter.get({
    name: 'status-details',
    path: '/v1/geo-transactions/status/details',
    handlers: [controller.details]
  });
}

module.exports = {
  register,
};
