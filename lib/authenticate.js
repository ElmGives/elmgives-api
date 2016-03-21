/**
 * Validate current user against session stored
 */
'use strict';

let Session = require('../sessions/session');
let error = require('./error');
let validSession = require('../helpers/validSession');

module.exports = (request, response, next) => {

    let query = {
        token: request.userToken,
        agent: request.headers['user-agent']
    };

    return Session
        .findOne(query)
        .exec()
        .then(session => {
            if (!session) {
                return response.status(401).json({
                    error: 'authentication required'
                });
            }

            return session;
        })
        .then(session => {
            if (!validSession(session.expire)) {
                return response.status(422).json({
                    error: 'session expired'
                });
            }

            request.session = session;
            return next();
        })
        .catch(error(response));
};
