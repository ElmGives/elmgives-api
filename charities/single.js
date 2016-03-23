/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

module.exports = function single(request, response) {
    const userId = request.params.id + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;

    response.json({
        data: [user.charities.id(request.params.charityId)]
    });
};
