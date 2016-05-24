/**
 * Middleware to create socials based on request body object provided
 */
'use strict';

const Social = require('/social');

module.exports = (request, response) => {
    return new Social(request.body)
        .save()
        .then(data => response.json(data))
        .catch(error => response.status(422).json(error));
};
