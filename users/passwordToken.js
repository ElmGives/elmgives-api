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
        code: +request.body.code
    };

    return RecoveryCode
        .findOne(query)
        .then(data => {
            if (!data) {
                let error = new Error();
                error.status = 404;
                error.message = 'Code already used';

                return Promise.reject(error);
            }

            /**
             * Sign code with user's email, this token will be use only once
             * and it's used to verify new password against user who requested.
             */
            let toEncode = {
                token: data.code
            };

            return jsonWebToken(toEncode, data.userEmail);
        })
        .then(token => {
            response.json({
                data: [{
                    token: token
                }]
            });
        })
        .catch(next);
};
