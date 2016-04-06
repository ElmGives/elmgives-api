/**
 * Middleware to remove charities associated to an user
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

    let charity = user.charities.id(request.params.charityId);

    if (!charity) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity not found';

        return next(error);
    }

    charity.remove();

    user
        .save()
        .then(() => response.send())
        .catch(next);
};
