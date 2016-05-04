/**
 * Middleware to manage user accounts
 *
 * Normal POST /users will create a user
 *
 * Handles verification of accounts by validate token provided via email
 * Sends one time to token to recovery password
 * Handles change passwords
 */
'use strict';

const User = require('./user');
const email = require('../email/mandrill');
const logger = require('../logger');

const CLIENT_URL = process.env.CLIENT_URL;
const TEMPLATE = process.env.MANDRILL_VERIFY_ACCOUNT_EMAIL_TEMPLATE;

module.exports = function create(request, response, next) {

    return new User(request.body)
        .save()
        .then(user => {
            request.userData = user;
            let to = [{
                email: user.email
            }];

            let options = [{
                name: 'link',
                content: `${CLIENT_URL}${user.verificationToken}`
            }];

            return email.send(TEMPLATE, to, options);
        })
        .then(sent => {
            logger.info({
                verificationEmail: sent
            });
            /**
             * There's nothing defined ( yet ) to do with sent email id
             */
            let result = {
                data: {
                    name: request.userData.name,
                    _id: request.userData._id,
                    firstName: request.userData.firstName,
                    lastName: request.userData.lastName,
                    email: request.userData.email,
                    verified: request.userData.verified
                }
            };
            response.json(result);
        })
        .catch(next);
};
