/**
 * Middleware to create post based on npo and and media provided
 */
'use strict';

const Post = require('./post');
const Npo = require('../npos/npo');
const validMedia = require('../helpers/validMedia');

module.exports = function create(request, response, next) {
    request.body.userId = request.session._id;
    let images = request.body.images;
    let videos = request.body.videos;

    if (!validMedia(images, 'images') || !validMedia(videos, 'videos')) {
        let error = new Error();
        error.status = 422;
        error.message = 'Invalid images/videos object';

        return next(error);
    }

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
        .then(post => response.json({
            data: post
        }))
        .catch(next);
};
