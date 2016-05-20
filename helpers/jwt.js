/**
 * Return json web token based on session object
 */
'use strict';

/**
 * JsonWebToken implementation for node.js
 * @see  http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
 * https://github.com/auth0/node-jsonwebtoken
 */
const jwt = require('jsonwebtoken');
const options = {
    algorithm: 'HS256'
};

module.exports = (data, salt) => {
    return new Promise((resolve, reject) => {
        /**
         * Sign `data` with `salt`
         */
        return jwt.sign(data, salt, options, (error, token) => {
            return error ? reject(error) : resolve(token);
        });
    });
};
