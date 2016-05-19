/**
 * Update password helper
 */

'use strict';

const comparePassword = require('../helpers/comparePassword');
const hashPassword = require('../helpers/hashPassword');
const passwordValidator = require('../helpers/passwordValidator');

module.exports = function updatePassword(body, user) {
    return comparePassword(body.password, user.password)
        .then(isValid => {
            if (!isValid) {
                let error = new Error();
                error.status = 422;
                error.message = 'Invalid credentials';

                return Promise.reject(error);
            }

            return passwordValidator(body.newPassword);
        })
        .then(() => {
            return hashPassword(body.newPassword);
        })
        .then(hash => {
            user.password = hash;
            return user.save();
        });
};

