'use strict';

const register = (apiRouter, server) => {
  require('./routes').register(apiRouter, server);
  require('./status/routes').register(apiRouter);
};

module.exports = {
  register
};
