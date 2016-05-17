/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

module.exports = function update(request, response, next) {
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
    let active = user.pledges.find(item => item.active);

    if (!pledge) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity not found';
        return next(error);
    }
    if (request.body.active === true && !pledge.active) {
        pledge.active = true;
        if (typeof active === 'object') {
            active.active = false;
            pledge.addresses.unshift(active.addresses.shift());
        }
    }

    /* Updatas to pledge properties */
    // (changes to monthlyLimit will be reflected in the next month)
    pledge.monthlyLimit = request.body.monthlyLimit || pledge.monthlyLimit;

    user.save()
        .then(( /*user*/ ) => response.json({
            data: [pledge]
        }))
        .catch(next);
};
