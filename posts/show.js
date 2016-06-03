/**
 * GET single Post
 */
'use strict';

const Post = require('./post');

module.exports = function show(request, response, next) {
    if (!request.params.id) {
        return response.status(422).json({
            error: 'required params missing'
        });
    }

    let query = {
        _id: request.params.id
    };

    return Post
        .findOne(query)
        .populate('npoId', 'name')
        .then(found => {
            if (!found) {
                let error = new Error();
                error.status = 404;
                error.message = 'Resource not found';

                return next(error);
            }

            return response.json({
                data: found
            });
        })
        .catch(next);
};
