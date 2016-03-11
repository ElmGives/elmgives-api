/**
 * Get information from json web token
 */
'use strict';

const verifyToken = require('../helpers/verifyToken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (request, response, next) => {
    const token = request.headers.authorization;
    console.log(request.headers.authorization);

    return verifyToken(token, JWT_SECRET)
        .then(value => {
            console.log('value', value);
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
