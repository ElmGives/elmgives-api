/**
 * Middleware to create socials based on request body object provided
 */
'use strict';

const Social = require('/social');
const validateFacebook = require('./validateFacebook');

module.exports = function create(request, response, next) {
    let token = request.body.token;
    let email = request.body.email;
    let providerId = request.body.providerId;

    if (!token && !providerId && !email) {
        let error = new Error();
        error.status = 422;
        error.message = 'Required fields missing: email, token, providerId';

        return next(error);
    }

    return validateFacebook(token)
        .then(() => new Social(request.body).save())
        .then(saved => {
            /**
             * TODO:
             * Create session and return it.
             */
            return saved;
        })
        .then(data => response.json(data))
        .catch(next);
};
