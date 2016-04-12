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

module.exports = (data, salt) => {
    return new Promise((resolve, reject) => {
        return jwt.sign(data, salt, {
            algorithm: 'HS256'
        }, function(token, error) {
            error ? reject(error) : resolve(token);
        });
    });
};
