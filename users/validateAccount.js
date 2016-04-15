/**
 * Middleware to verify users accounts
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
        .then(( /*userSaved*/ ) => {
            return response.send();
        })
        .catch(next);
};
