/**
 * Middleware to work with current User model
 */

'use strict';
const User = require('../users/user');

module.exports = function currentUser(request, response, next) {
    const query = {
        _id: request.session.userId
    };

    User
        .findOne(query)
        .then(user => {
            if (!user) {
                let error = new Error();
                error.status = 422;
                error.message = 'Resource not found';

                return next(error);
            }

            request.currentUser = user;
            next();
        })
        .catch(next);
};
