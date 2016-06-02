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
const slack = require('../slack');

const CLIENT_URL = process.env.CLIENT_URL;
const TEMPLATE = process.env.MANDRILL_VERIFY_ACCOUNT_EMAIL_TEMPLATE;

function sendEmail(user) {
    let to = [{
        email: user.email
    }];

    let options = [{
        name: 'link',
        content: `${CLIENT_URL}${user.verificationToken}`
    }];

    return email.send(TEMPLATE, to, options)
        .then(sent => {
            logger.info({
                verificationEmail: sent
            });

        })
        .catch(error => {
            logger.error({
                err: error
            }, 'Verification email');

            slack(error)
                .then(data => logger.info(data))
                .catch(error => logger.error(error));
        });
}

module.exports = function create(request, response, next) {

    return new User(request.body)
        .save()
        .then(user => {
            sendEmail(user);

            let result = {
                data: {
                    name: user.name,
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    verified: user.verified,
                }

            };

            /**
             * Send roleId only if present, for admin purposes
             * as per requirements defined
             */
            if (user.roleId) {
                result.data.roleId = user.roleId;
            }

            response.json(result);
        })
        .catch(next);
};
