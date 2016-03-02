/**
 * Middleware to log access to the system
 */
'use strict';
let logger = require('../logger');

module.exports = (request, response, next) => {
    logger.info({
        req: request
    });
    next();
};
