/**
 * Helper middleware, used to delete a document.
 */
'use strict';

const Post = require('./post');

module.exports = (request, response, next) => {

    let query = {
        _id: request.params.id
    };

    return Post
        .findOne(query)
        .then(data => {
            if (!data) {
                let error = new Error();
                error.status = 404;
                error.message = 'Resource not found';
                return Promise.reject(error);
            }

            return Post.remove(query);
        })
        .then(() => response.json({
            data: []
        }))
        .catch(next);
};
