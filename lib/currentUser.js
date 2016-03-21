/**
 * Middleware to work with current User model
 */

'use strict';
const User = require('../users/user');

module.exports = (request, response, next) => {
    const query = {
        _id: request.session.userId
    };

    User
        .findOne(query)
        .then(user => {
            if (!user) {
                return response
                    .status(422)
                    .json({
                        error: {
                            message: 'no user found'
                        }
                    });
            }
            request.currentUser = user;
            next();
        })
        .catch(error => next(error));
};
