/**
 * Helper method to return generic error to the client
 */
'use strict';

const logger = require('../logger');
const validationErrors = require('../helpers/validationErrors');

module.exports = (response, statusCode, message) => {
    return error => {

        if (error.name === 'ValidationError') {
            error = {
                error: error.name,
                errors: validationErrors(error)
            };
        } else {
            logger.error(error);
        }

        return response.status(statusCode || 422).json(error || message);
    };
};
