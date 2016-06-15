/**
 * Middleware to create socials based on request body object provided
 *
 * 1.  Validate token against facebook API
 * 2.  If provided token is invalid, return error, otherwise, find Social with
 *     provided providerId and email
 * 3.  If social found, create session and return , otherwise, create social,
 * 4.  Create session and return
 */
'use strict';

const Social = require('/social');
const User = require('../users/user');
const Session = require('../sessions/session');
const uniqueToken = require('../helpers/token');
const expire = require('../helpers/expire');
const EXPIRE = process.env.EXPIRE_HOURS;
const validateFacebook = require('./validateFacebook');

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

    return validateFacebook(token)
        .then(valid => {
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

            return Social.findOne(query);
        })
        .then(social => {
            if (!social) {
                // create social, and user and return
                // user data needed to create an account: email and password
                // Since password is not present on social login, @cooper said
                // let's use a random
                let userData = {
                    email: email,
                    password: uniqueToken()
                };

                new User(userData).save();
                return new Social(request.body).save();
            }

            return social;
        })
        .then(social => {
            let query = {
                email: social.email,
            };
            /**
             * If request get's here, means:
             *     user's token is a valid Facebook token, social information
             *     exist and we are ready to find related user and create a
             *     session.
             */
            return User.findOne(query);
        })
        .then(user => {
            let session = {
                token: uniqueToken(),
                expire: expire(EXPIRE),
                userId: user._id,
                agent: request.headers['user-agent'],
                verified: true
            };

            return new Session(session).save();
        })
        .then(data => response.json(data))
        .catch(next);
};
