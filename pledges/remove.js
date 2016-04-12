/**
 * Middleware to remove pledges associated to an user
 */
'use strict';

module.exports = function remove(request, response, next) {
    const userId = request.params.id + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;

    let pledge = user.pledges.id(request.params.pledgeId);

    if (!pledge) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity not found';

        return next(error);
    }

    pledge.remove();

    user
        .save()
        .then(() => response.send())
        .catch(next);
};
