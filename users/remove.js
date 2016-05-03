/**
 * Helper middleware, used to archive an user
 * Instead of remove user, we just archive them
 *
 * Find user based on id, then
 * update archived property to true
 * if error, move to next middleware with error otherwise,
 * return empty response, menaing, user 'removed'
 */
'use strict';

const User = require('./user');
const archive = {
    archived: true
};

const defaultResponse = {
    data: {}
};

module.exports = function remove(request, response, next) {

    let query = {
        _id: request.params.id
    };

    return User
        .findOne(query)
        .then(() => User.update(query, archive))
        .then(() => response.json(defaultResponse))
        .catch(next);
};
