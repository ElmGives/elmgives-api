/**
 * Helper middleware, used to update an user.
 * It's used for admin users and for regular users.
 * Admin user is enabled to modify ALL user information included other admin
 * users(as per requirements).
 */
'use strict';

const User = require('./user');
const updatePassword = require('./updatePassword');

/**
 * @see https://github.com/blakehaswell/mongoose-unique-validator#find--updates
 */
const options = {
    runValidators: true,
    context: 'query'
};

const defaultResponse = {
    data: {}
};


module.exports = function update(request, response, next) {

    if (!request.params.id) {
        return response.status(422).json({
            error: 'required params missing'
        });
    }

    let query = {
        _id: request.params.id
    };

    return User
        .findOne(query)
        .then(user => {
            if (!user) {
                let error = new Error();
                error.message = 'User not found';
                error.status = 404;

                return Promise.reject(error);
            }

            /**
             * Update password
             */
            if (request.body.password && request.body.newPassword) {
                return updatePassword(request.body, user);
            }

            /**
             * Remove password and avoid store plain password to db
             */
            delete request.body.password;
            delete request.body.stripe;
            delete request.body.plaid;

            return User.update(query, request.body, options);
        })
        .then(() => response.json(defaultResponse))
        .catch(next);
};
