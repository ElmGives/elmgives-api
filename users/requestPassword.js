/**
 * Middleware to verify users accounts
 */
'use strict';

const User = require('./user');
const email = require('../email/mandrill');
const logger = require('../logger');
const verificationCode = require('../helpers/verificationCode');
const RecoveryCode = require('./recoveryCode');
const code = require('../helpers/verificationCode');

const TEMPLATE = process.env.MANDRILL_RECOVERY_PASSWORD_EMAIL_TEMPLATE;

module.exports = function requestPassword(request, response, next) {
    const query = {
        email: request.body.requestPassword
    };

    return User
        .findOne(query)
        .then(user => {
            if (!user) {
                let error = new Error();
                error.status = 404;
                error.message = 'User not found';
                return next(error);
            }

            request.userData = user;

            let data = {
                userId: user._id,
                code: code()
            };

            return new RecoveryCode(data).save();
        })
        .then(recovery => {

            let to = [{
                email: request.userData.email
            }];

            let options = [{
                name: 'code',
                content: verificationCode()
            }];

            return email.send(TEMPLATE, to, options);
        })
        .then((sent) => {
            sent = sent[0] || {};

            logger.info(`Recovery password for ${sent.email} status: ${sent.status}, mandrillId:${sent._id}`);

            response.json({
                data: [{
                    email: 'sent'
                }]
            });
        })
        .catch(next);
};
