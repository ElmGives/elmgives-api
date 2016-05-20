/**
 * Helper middleware, used to update a document.
 */
'use strict';

const Npo = require('../npos/npo');
const Post = require('./post');
const validMedia = require('../helpers/validMedia');

const options = {
    runValidators: true
};

/**
 * First find Post with provided id
 * then find Npo with provided npoId param
 * after valdiate existence of both, update and respond with proper data
 */
module.exports = function update(request, response, next) {

    if (!validMedia(request.body.images) || !validMedia(request.body.videos)) {
        let error = new Error();
        error.status = 422;
        error.message = 'Invalid images/videos object';
        return next(error);
    }

    const npoQuery = {
        _id: request.body.npoId
    };

    let query = {
        _id: request.params.id
    };

    let error = new Error();
    error.status = 404;
    error.message = 'Required resource not found';

    return Post
        .findOne(query)
        .then(post => {
            if (!post) {
                error.message = 'Post not found';
                Promise.reject(error);
            }

            request.postFound = post;
            return Npo.findOne(npoQuery);
        })
        .then(npo => {
            if (!npo) {
                error.message = 'NPO not found';
                return Promise.reject(error);
            }

            return Post.update(query, request.body, options);
        })
        .then(() => {
            return response.json({
                data: {}
            });
        })
        .catch(next);
};
