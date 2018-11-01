'use strict';
const crypto = require('crypto');

const checkContains = (obj, requiredFields) => {
  const missingFields = requiredFields.filter(field => {
    return !obj[field] && obj[field] !== 0 && obj[field] !== false;
  });
  if (missingFields.length > 0) {
    throw new Error(`The following fields are missing: ${missingFields.join(', ')}.`);
  }
};

const TSN_LENGTH = 18;
const TSN_PADDING = Array(TSN_LENGTH).join('0');

const SHA1 = unpaddedStr => {
  const paddedStr = (TSN_PADDING + unpaddedStr).slice(-TSN_LENGTH);
  return crypto.createHash('sha1').update(paddedStr).digest('hex');
};

const MD5 = str => crypto.createHash('md5').update(str).digest('hex');

module.exports = {
  checkContains,
  SHA1,
  MD5,
};
