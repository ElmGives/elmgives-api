/**
 * Generic module to find list of models based on model param
 */
'use strict';

const User = require('./user');
const defaultQuery = {
    archived: false
};

module.exports = function list(request, response, next) {
    return User
        .find(defaultQuery)
        .then(users => {
            let data = users.map(user => {
                user.password = undefined;
                return user;
            });

            return response.json({
                data: data,
                meta: {
                    count: users.length
                }
            });
        })
        .catch(next);
};
