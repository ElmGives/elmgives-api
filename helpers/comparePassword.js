/**
 * Compare password against hashed one
 */
'use strict';
const bcrypt = require('bcrypt');

module.exports = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (error, result) => {
            error ? reject(error) : resolve(result);
        });
    });
};
