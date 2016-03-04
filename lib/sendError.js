/**
 * Respond with proper error format for development and production
 * environments
 */
'use strict';

const logger = require('../logger');

module.exports = (isProduction) => {
    /*jshint unused: false*/
    return (error, request, response, next) => {
        logger.error(error);
        response
            .status(error.status || 422)
            .json({
                error: isProduction ? error.message : error
            });
    };
};
