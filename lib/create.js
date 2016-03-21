/**
 * Middleware to create resource based on model and body provided
 */
'use strict';

const error = require('../lib/error');
const success = require('../lib/success');

module.exports = Model => {
    return (request, response) => {
        request.body.userId = request.session._id;

        return new Model(request.body)
            .save()
            .then(success(response))
            .catch(error(response));
    };
};
