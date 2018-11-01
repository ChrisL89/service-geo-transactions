'use strict';

const _ = require('lodash');

const NAME = 'ApiError';
const ALLOWABLE_ARGS = Object.freeze([
  'code', // String that can be used as a stable key
  'message', // User friendly message
  'status', // HTTP response status code
  'reason', // Underlying error that triggered this error
  'details', // Fine-grained details such as list of field errors
  'diagnostics', // Additional information to log, but not include in the API response
]);
const PROPERTY_KEYS = _.concat(ALLOWABLE_ARGS, 'stack');
const DEFAULT_PROPERTIES = {
  status: 500,
  code: 'SERVICE_UNAVAILABLE_ERROR',
  message: 'The service has encountered an unexpected error',
};
const INVALID_STATUSES = [502, 504];

/**
 * Class representing an API Error.
 * @extends Error
 */
class ApiError extends Error {

  /**
   * Create an API Error.
   * @param {object} args - The error
   */
  constructor(args) {
    super();

    this.name = 'ApiError';
    // Assign a minimal set of error information to this object that will result in a valid response
    // being sent to the API client.  We may override/update as we discover more information.
    _.assign(this, DEFAULT_PROPERTIES);
    Error.captureStackTrace(this, this.constructor);

    if (!_.isObject(args)) {
      // This is a programming error.
      throw new Error(`Invalid ${NAME} arguments`);
    } else if (args instanceof Error) {
      // An error is an unexpected event, and may contain sensitive information.  Configure a
      // generic error message to be returned to the client, and attach the original error as the
      // reason so that it can be logged.
      this.reason = args;
    } else {
      // Ensure no additional arguments (or stack) have been provided, this is most likely a
      // programming error.
      const additionalKeys = _.difference(_.keys(args), ALLOWABLE_ARGS);
      if (additionalKeys.length > 0) {
        throw new Error(`Invalid arguments: ${additionalKeys}`);
      }

      // Assign the provided error arguments.
      _.extend(this, args);

      // Never return a 502 or 504 error or api-service-gw will mark us as down, even
      // though it's a downstream service, not us, that has the error.
      if (INVALID_STATUSES.includes(this.status)) {
        this.status = DEFAULT_PROPERTIES.status;
      }
    }
  }

  /** toJSON method for Restify res.send() to `render` errors */
  toJSON() {
    const json = _.pick(this, PROPERTY_KEYS);
    if (json.reason) {
      json.reason = this.toJSON.apply(json.reason, arguments);
    }
    return json;
  }

  /** toString method for Restify res.send() to `render` errors */
  toString() {
    return JSON.stringify(this);
  }
}

module.exports = ApiError;
