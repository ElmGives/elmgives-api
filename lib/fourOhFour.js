/**
 * 404 Middleware
 * Used as default response for non found resources or routes
 */
'use strict';

module.exports = (request, response, next) => {
    let error = new Error();
    error.message = 'Resource not found';
    error.status = 404;

    next(error);
};
