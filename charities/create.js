/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

const Charity = require('./charity');

module.exports = (request, response, next) => {
    const userId = request.body.userId + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;
    let charity = new Charity(request.body);

    user.charities.push(charity);

    user
        .save()
        .then(( /*user*/ ) => response.json({
            data: [charity]
        }))
        .catch(error => next(error));
};
