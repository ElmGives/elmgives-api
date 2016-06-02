/**
 * Apply custom middlewares to request
 * Usage:
 *     1- Identify that you require dynamic middlewares for your endpoint.
 *     2- assign each middleware to a variable and push it to an array
 *         const middlewares = [middleware1, middlware2];
 *     3- require this file with expected objects.
 *
 * Example:
 *     refers to ./users/index.js file where we use same POST /users with custom
 *     middlewares to create regular users or users from Admin perspective
 */

'use strict';

const async = require('async');

/**
 * middlewares: array of middlewares like require('./authenticate')
 * request: request object from express middleware
 * response: response object from express middleware
 * next: callback from express middleware
 */
function customMiddlewares(middlewares, request, response, next) {

    /**
     * Bind each middleware to current request|response object for the actual
     * request to the endpoint
     */
    let operations = (middlewares || []).map(middleware => {
        return middleware.bind(null, request, response);
    });

    /**
     * Run each middleware defined and associated to current request, if any
     * error, it will be handled by the `next` callback, also, on success or
     * internally called `next` for each middleware, call the next one in a
     * sequence
     */
    return async.series(operations, (error) => next(error));
}

module.exports = customMiddlewares;
