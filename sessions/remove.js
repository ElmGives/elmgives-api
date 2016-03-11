/**
 * Helper middleware, used to delete a document.
 */
'use strict';

const Session = require('./session');
const error = require('../lib/error');

module.exports = (request, response) => {

    let query = {
        token: request.userToken,
        agent: request.headers['user-agent']
    };

    return Session
        .findOne(query)
        .then(data => {
            /**
             * Could be deleted previously
             */
            if (!data) {
                return response.send();
            }
            return Session.remove(query);
        })
        .then(( /*removed*/ ) => response.send())
        .catch(error(response));
};
