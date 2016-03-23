/**
 * Middleware to create user accounts
 */
'use strict';

const Session = require('./session');
const User = require('../users/user');
const token = require('../helpers/token');
const expire = require('../helpers/expire');
const EXPIRE = process.env.EXPIRE_HOURS;
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('../helpers/jwt');
const comparePassword = require('../helpers/comparePassword');

module.exports = function create(request, response, next) {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
        let error = new Error();
        error.status = 422;
        error.message = 'Invalid credentials';
        return next(error);
    }

    let findQuery = {
        email: email
    };

    /**
     * Find user with specified email
     * then: Validate password
     * then: Based on user found, create a session object and save it
     * then: Create a json web token
     * then: return response
     */
    return User
        .findOne(findQuery)
        .then(user => {
            if (!user) {
                let error = new Error();
                error.status = 422;
                error.message = 'Invalid credentials';

                return next(error);
            }

            /**
             * Store user found, to be used after validate user's password
             */
            request.accountUser = user;

            return comparePassword(password, user.password);
        })
        .then(isValid => {

            if (!isValid) {
                let error = new Error();
                error.status = 422;
                error.message = 'Invalid credentials';

                return next(error);
            }

            let session = {
                token: token(),
                expire: expire(EXPIRE),
                userId: request.accountUser._id,
                agent: request.headers['user-agent'],
                verified: request.accountUser.verified
            };

            return new Session(session).save();
        })
        .then(session => {
            request.expiresIn = session.expire;
            return jwt({
                token: session.token
            }, JWT_SECRET);
        })
        .then(token => {
            response.json({
                expire: request.expiresIn,
                token: token,
                firstName: request.accountUser.firstName,
                id: request.accountUser._id,
                email: request.accountUser.email,
                verified: request.accountUser.verified
            });
        })
        .catch(next);
};
