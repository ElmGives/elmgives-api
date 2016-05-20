/**
 * Get information from json web token
 */
'use strict';

const jwt = require('jsonwebtoken');

module.exports = (token, JWT_SECRET) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (error, decoded) => {
            return error ? reject(error) : resolve(decoded.token);
        });
    });
};
