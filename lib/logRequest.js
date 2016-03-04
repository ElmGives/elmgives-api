/**
 * Middleware to log access to the system
 */
'use strict';

const logger = require('../logger');

module.exports = (request, response, next) => {
    logger.info({
        req: request
    });

    return next();
};
