/**
 * Respond with proper error format for development and production
 * environments
 */
'use strict';

module.exports = (isProduction) => {
    return (error, request, response, next) => {
        console.log(error);
        response
            .status(error.status || 422)
            .json({
                error: isProduction ? error.message : error
            });
    }
};
