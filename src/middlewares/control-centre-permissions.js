const _ = require('lodash');
const errors = require('restify-errors');

module.exports = options => {
  return function (req, res, next) {
    if (req.jwt) {
      if (options.overrideScopes && _.intersection(options.overrideScopes.concat(['*']), req.jwt['client.scopes']).length > 0) {
        return next();
      }
      const matches = ['read', 'write'].some(key => {
        if (options[key]) {
          let permissions = options[key];
          if (!Array.isArray(permissions)) {
            permissions = [permissions];
          }
          const controlCentrePermission = req.jwt['control-centre.permissions'] && req.jwt['control-centre.permissions'][key];
          return permissions.some(permission => controlCentrePermission && controlCentrePermission[permission]);
        }
        return false;
      });
      if (!matches) {
        return next(new errors.ForbiddenError('Insufficient privileges'));
      }
    }
    next();
  };
};
