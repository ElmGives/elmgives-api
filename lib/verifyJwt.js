/**
 * Get information from json web token
 */
'use strict';

const verify = require('../helpers/verifyToken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function verifyToken(request, response, next) {
    const token = request.headers.authorization;

    if (!token) {
        return response.status(422).json({
            error: 'token required'
        });
    }

    return verify(token, JWT_SECRET)
        .then(value => {
            request.userToken = value;
            next();
        })
        .catch(error => {
            request.userToken = null;
            /**
             * Invalid tokens will get here
             */
            next(error);
        });
};
