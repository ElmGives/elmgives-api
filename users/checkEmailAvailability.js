'use strict';

const User = require('./user');

const passwordValidator = require('../helpers/passwordValidator');

/**
 * Used as a preliminary check for a valid user before user is actually created
 * Called by the client to verify email & password, but the actual create will
 * not occur until the user agrees with the Terms and Conditions
 *
 * @param request
 * @param response
 * @param next
 */
function checkEmailAvailability(request, response, next) {
    let email = request.body.email;
    if (!email) {
        let error = new Error();
        error.status = 400;
        error.message = 'Email parameter is required';
        return next(error);
    }

    let query = {email};

    return User
        .findOne(query)
        .then(user => {
            if (user) {
                let error = new Error();
                error.status = 422;
                error.available = false;
                error.message = 'That email is already in use';

                return Promise.reject(error);
            }

            return passwordValidator(request.body.password);
        })
        .then(() => response.json({
          data: {
            email,
            available: true
          }
        }))
        .catch(next);
}

module.exports = checkEmailAvailability;
