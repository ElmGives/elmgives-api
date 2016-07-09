/**
 * Middleware to send token used to change password
 * Find code by proived code, then
 * ecrypt code with user email, then
 * send token
 */
'use strict';

const jsonWebToken = require('../helpers/jwt');
const RecoveryCode = require('./recoveryCode');


module.exports = function passwordToken(request, response, next) {
    const query = {
        code: +request.body.code,
        userEmail: request.body.changePassword
    };

    return RecoveryCode
        .findOne(query)
        .then(recoveryCode => {
            if (!recoveryCode) {
                let error = new Error();
                error.status = 404;
                error.message = 'No recovery code for this email';

                return Promise.reject(error);
            }

            /**
             * Sign code with user's email, this token will be use only once
             * and it's used to verify new password against user who requested.
             */
            let toEncode = {
                token: recoveryCode.code
            };

            /* Remove code record and generate a JSON web token */
            return recoveryCode.remove()
                .then(() => jsonWebToken(toEncode, recoveryCode.userEmail));
        })
        .then(token => {
            response.json({
                data: {
                    token: token
                }
            });
        })
        .catch(next);
};
