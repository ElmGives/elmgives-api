/**
 * Respond with proper error format for development and production
 * environments
 */
'use strict';

const validationErrors = require('../helpers/validationErrors');
const logger = require('../logger');

module.exports = (isProduction) => {
    /*jshint unused: false*/
    return (error, request, response, next) => {
        logger.error(error);

        if (error.name === 'ValidationError') {
            error = {
                error: error.name,
                errors: validationErrors(error)
            };
        }

        response
            .status(error.status || 422)
            .json(isProduction ? error.message : error);
    };
};
