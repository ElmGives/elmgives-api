/**
 * Validate current user against session stored
 */
'use strict';

let Session = require('../sessions/session');
let validSession = require('../helpers/validSession');

module.exports = function authenticate(request, response, next) {

    let query = {
        token: request.userToken,
        agent: request.headers['user-agent']
    };

    return Session
        .findOne(query)
        .exec()
        .then(session => {
            if (!session) {
                let error = new Error();
                error.status = 401;
                error.message = 'Authentication required';

                return next(error);
            }

            return session;
        })
        .then(session => {
            if (!validSession(session.expire)) {
                let error = new Error();
                error.status = 422;
                error.message = 'Session expired';

                return next(error);
            }

            request.session = session;
            return next();
        })
        .catch(next);
};
