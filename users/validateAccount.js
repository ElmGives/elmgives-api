/**
 * Middleware to verify users accounts
 *
 * Find user with specified verification token
 * If no user found, return 404 status error and response ( handled by `next` )
 * If user found, set `verificationToken` to empty string and save user
 * then return default response format with empty response.
 */
'use strict';

const User = require('./user');

module.exports = function validateAccount(request, response, next) {
    const query = {
        verificationToken: request.body.verificationToken
    };

    return User
        .findOne(query)
        .then(user => {
            if (!user) {
                let error = new Error();
                error.status = 404;
                error.message = 'Token already used';

                return next(error);
            }

            user.verificationToken = '';

            return user.save();
        })
        .then(() => response.send({
            data: []
        }))
        .catch(next);
};
