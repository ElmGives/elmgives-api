/**
 * Middleware to validate recovery password token
 */
'use strict';

const User = require('./user');
const RecoveryCode = require('./recoveryCode');
const verifyToken = require('../helpers/verifyToken');
const hashPassword = require('../helpers/hashPassword');

module.exports = function requestPassword(request, response, next) {

    /**
     * Get code from encrypted json web token
     */
    return verifyToken(request.body.token, request.body.resetPassword)
        .then(code => {
            if (!code) {
                let error = new Error();
                error.message = 'Invalid token';
                error.status = 422;

                return Promise.reject(error);
            }

            request.recoveryCode = code;

            /**
             * Let's find RecoveryCode and validate it against `code` value
             */
            let query = {
                code: code
            };

            return RecoveryCode.findOne(query);
        })
        .then(code => {
            if (!code || code.code !== request.recoveryCode) {
                let error = new Error();
                error.message = 'Invalid request token';
                error.status = 422;

                return Promise.reject(error);
            }

            /**
             * Now we know that the code matches encrypted value and the request
             * belongs to the user. Let's find user and validate email
             */
            let query = {
                _id: code.userId
            };

            return User.findOne(query);
        })
        .then(user => {
            if (!user || user.email !== request.body.resetPassword) {
                let error = new Error();
                error.message = 'Invalid request token';
                error.status = 422;

                return Promise.reject(error);
            }

            request.userData = user;

            /**
             * Let's encrypt new password, associate it to the user and save it
             */
            return hashPassword(request.body.password);
        })
        .then(hash => {
            let user = request.userData;

            user.password = hash;

            return user.save();
        })
        .then(saved => {
            response.json({
                data: []
            });
        })
        .catch(next);
};
