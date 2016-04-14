/**
 * Respond with proper error format for development and production
 * environments
 */
'use strict';

const validationErrors = require('../helpers/validationErrors');
const logger = require('../logger');

module.exports = function sendErrors() {
    /*jshint unused: false*/
    return (error, request, response, next) => {
        logger.error({
            err: error
        });

        if (error.name === 'ValidationError') {
            error = {
                status: 422,
                message: error.message,
                errors: validationErrors(error)
            };
        }

        response
            .status(error.status || 422)
            .json(error);
    };
};
