/**
 * Middleware to create user accounts
 */
'use strict';

const User = require('./user');
const error = require('../lib/error');

module.exports = (request, response) => {
    return new User(request.body)
        .save()
        .then(user => {
            let result = {
                name: user.name,
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };

            response.json(result);
        })
        .catch(error(response));
};
