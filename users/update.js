/**
 * Helper middleware, used to update an user.
 * It's used for admin users and for regular users.
 * Admin user is enabled to modify ALL user information included other admin
 * users(as per requirements).
 */
'use strict';

const User = require('./user');

const options = {
    runValidators: true
};

const defaultResponse = {
    data: {}
};

module.exports = function update(request, response, next) {

    let query = {
        _id: request.params.id
    };

    return User
        .findOne(query)
        .then(() => {
            return User.update(query, request.body, options);
        })
        .then(() => response.json(defaultResponse))
        .catch(next);
};
