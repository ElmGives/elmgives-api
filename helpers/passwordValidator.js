/**
 * Validate password:
 *     1 upper case character
 *     1 lower case character
 *     1 numeric character
 *     8 min length
 */
'use strict';

/**
 * Provided by https://github.com/lucho99
 * (?=.*[A-Z]{1,}) -> Validates the string has at least 1 upper character
 * (?=.*[a-z]{1,}) -> Validates the string has at least 1 lower character
 * (?=.*[0-9]{1,}) -> Validates the string has at least 1 numeric character
 * .{8,} -> Validates the string has a minimun length of 8
 */
const REGEXP = /^(?=.*[A-Z]{1,})(?=.*[0-9]{1,})(?=.*[a-z]{1,}).{8,}$/;

module.exports = function validatePassword(password) {
    return new Promise((resolve, reject) => {
        let valid = REGEXP.test(password);

        if (valid) {
            return resolve(valid);
        }

        let error = new Error();
        error.status = 422;
        error.message = 'Invalid password format';
        error.errors = {
            password: '1 upper&lower case, 1 number, 8 char length'
        };

        return reject(error);
    });
};
