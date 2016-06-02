/**
 * Middleware to create resource based on model and body provided
 */
'use strict';

module.exports = Model => {
    return function create(request, response, next) {
        request.body.userId = request.session._id;

        return new Model(request.body)
            .save()
            .then(data => response.json({
                data: data
            }))
            .catch(next);
    };
};
