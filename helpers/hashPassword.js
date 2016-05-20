/**
 * Password hash
 */

'use strict';
const bcrypt = require('bcrypt');

module.exports = function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 8, (error, hash) => {
            return error ? reject(error) : resolve(hash);
        });
    });
};
