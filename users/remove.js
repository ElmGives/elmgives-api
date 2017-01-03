/**
 * Helper middleware, used to archive an user
 * Instead of remove user, we just archive them
 *
 * Find user based on id, then
 * update archived property to true
 * if error, move to next middleware with error otherwise,
 * return empty response, menaing, user 'removed'
 */
'use strict';

const User = require('./user');
const prepareDelete = require('./prepareDelete');

const defaultResponse = {
    data: {}
};

function inactivatePledges(pledges) {
    return (pledges || []).map(item => item.active = false);
}

module.exports = function remove(request, response, next) {

    let query = {
        _id: request.params.id,
        archived: false
    };

    return User
        .findOne(query)
        .then((user) => {
            if (!user) {
                let error = Error();
                error.status = 422;
                error.message = 'User not found';

                return Promise.reject(error);
            }

            let data = prepareDelete(user);
            data.pledges = inactivatePledges(user.pledges);

            return data.save();
        })
        .then(() => response.json(defaultResponse))
        .catch(next);
};
