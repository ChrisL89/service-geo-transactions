const fs = require('fs');
const jsonwebtoken = require('jsonwebtoken');
const privateKey = fs.readFileSync(__dirname + '/keys/jwt-sign.key');

exports.createKey = function (payload) {
  return jsonwebtoken.sign(payload, privateKey, {
    algorithm: 'RS256',
    issuer: 'identity-service'
  });
};
