/**
 * Return json web token based on session object
 */
'use strict';

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
