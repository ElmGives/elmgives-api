/**
 * Middleware to create resource based on model and body provided
 */
'use strict';

const defaultResponse = require('../helpers/defaultResponse');
const Post = require('./post');
const Npo = require('../npos/npo');

module.exports = function create(request, response, next) {
    request.body.userId = request.session._id;

    const query = {
        _id: request.body.npoId
    };

    Npo
        .findOne(query)
        .then(npo => {
            if (!npo) {
                let error = new Error();
                error.status = 404;
                error.message = 'NPO not found';
                return Promise.reject(error);
            }

            return new Post(request.body).save();
        })
        .then(defaultResponse(response))
        .catch(next);

};
