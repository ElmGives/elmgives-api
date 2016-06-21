/**
 * Get information from json web token
 * Validate presence of Authorization token
 * Verify token against siged SECRET
 * Move to next middleware after store userToken(from jwt) to the request object
 * If any error, move to the default error handling using `next`
 */
'use strict';

const verify = require('../helpers/verifyToken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function verifyToken(request, response, next) {
    const token = request.headers.authorization;

    if (!token) {
        let error = new Error();
        error.message = 'Authorization token required';
        error.status = 422;

        return next(error);
    }

    return verify(token, JWT_SECRET)
        .then(value => {
            request.userToken = value;
            next();
        })
        .catch(next);
};
