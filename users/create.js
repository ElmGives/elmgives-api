/**
 * Middleware to create user accounts
 */
'use strict';

const User = require('./user');
const error = require('../lib/error');
const success = require('../lib/success');

module.exports = (request, response) => {
    return new User(request.body)
        .save()
        .then(success(response))
        .catch(error(response));
};
