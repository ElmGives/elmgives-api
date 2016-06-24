/**
 * Middleware to create socials based on request body object provided
 *
 * 1.  Validate token against facebook API
 * 2.  If provided token is invalid, return error, otherwise, find Social with
 *     provided providerId and email
 * 3.  If social found, create session and return , otherwise, create social,
 *     user and move to next step
 * 4.  Create session and return
 */
'use strict';

/**
 * Generate random string based on Regex.
 * Used to generate a random password that matches required attributes for User
 * model
 * @see  https://github.com/fent/randexp.js
 */
const Randexp = require('randexp');

const Social = require('./social');
const User = require('../users/user');
const Session = require('../sessions/session');
const uniqueToken = require('../helpers/token');
const expire = require('../helpers/expire');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('../helpers/jwt');

/**
 * In the future, we will validate `request.body.provider` and use proper
 * helper to validate token provided. For now only using facebook
 * @see  https://goo.gl/k0zzqu
 */
const validateFacebook = require('./validateFacebook');

const EXPIRE = process.env.EXPIRE_HOURS;
const REGEX = process.env.EMAIL_REGEX || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = function create(request, response, next) {
    let token = request.body.token;
    let email = request.body.email;
    let providerId = request.body.providerId;

    if (!token && !providerId && !email) {
        let error = new Error();
        error.status = 422;
        error.message = 'Required fields missing: email, token, providerId';

        return next(error);
    }

    /**
     * TODO:
     * Once new provider is added to social login options, validate
     * `request.body.provider` and use proper helper instead of hardcoded
     * `validateFacebook`
     */
    return validateFacebook(token)
        .then(valid => {

            /**
             * If validate token returns false, let's reject this request
             */
            if (!valid) {
                let error = Error();
                error.message = 'invalid token';
                error.status = 422;

                return Promise.reject(error);
            }

            let query = {
                providerId: providerId,
                email: email
            };

            /**
             * If provided token is valid, let's find Social record associated
             */
            return Social.findOne(query);
        })
        .then(social => {
            if (!social) {
                /**
                 * If no social found, means we need to create a Social record
                 * and a User.
                 * To create an user we use provided email and a random password
                 */
                let userData = {
                    email: email,
                    password: new Randexp(REGEX).gen()
                };

                /**
                 * First we need an user, then create a Social record, but,
                 * return user since we need user information to create a
                 * session
                 */
                return new User(userData).save().then(user => {
                    request.body.userId = user._id;
                    return new Social(request.body).save()
                        .then(() => user);
                });
            }

            /**
             * If social information found, means we can find user by email.
             * User is needed in order to create a session
             */
            let query = {
                email: email
            };

            return User.findOne(query);
        })
        .then((user) => {

            /**
             * It's possible to get here without an user?
             * Maybe we delete user and not social information.
             * Validate before return session
             */
            if (!user) {
                let error = Error();
                error.status = 422;
                error.message = 'Cant process request';

                return Promise.reject(error);
            }

            let session = {
                token: uniqueToken(),
                expire: expire(EXPIRE),
                userId: user._id,
                agent: request.headers['user-agent'],
                verified: true
            };

            return new Session(session).save()
                .then(session => {
                    return jwt({
                        token: session.token
                    }, JWT_SECRET)
                    .then(token => {
                        session.token = token;
                        return session;
                    });
                });
        })
        .then(data => response.json(data))
        .catch(next);
};
