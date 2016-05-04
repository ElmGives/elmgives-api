/**
 * Generic module to find list of models based on model param
 */
'use strict';

const Post = require('./post');
const postsDashboard = require('./postsDashboard');

const defaultQuery = {
    archived: false
};

module.exports = function list(request, response, next) {
    let query;

    if (request.query.npoId) {
        query = {};
        query.npoId = request.query.npoId;
    }

    if (request.query.dashboard) {
        return postsDashboard(request, response, next);
    }

    return Post
        .find(query || defaultQuery)
        .then(list => response.json({
            data: list
        }))
        .catch(next);
};
