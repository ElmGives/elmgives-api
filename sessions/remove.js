/**
 * Helper middleware, used to delete a document.
 */
'use strict';

const Session = require('./session');

module.exports = function remove(request, response, next) {

    let query = {
        token: request.userToken,
        agent: request.headers['user-agent']
    };

    let defaultResponse = {
        data: {}
    };

    return Session
        .findOne(query)
        .then(data => {
            /**
             * Could be deleted previously
             */
            if (!data) {
                return response.json(defaultResponse);
            }
            return Session.remove(query);
        })
        .then(() => response.json(defaultResponse))
        .catch(next);
};
