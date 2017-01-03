/**
 * Middleware to handle emails from mobile app
 */

'use strict';

const email = require('../email/mandrill').send;
const validateRequest = require('./validateRequest');

const sendTo = process.env.MANDRILL_ADMIN_EMAIL;
const TEMPLATE = process.env.MANDRILL_CONTACT_US_EMAIL_TEMPLATE;

const success = {
    data: {
        email: 'ok!'
    }
};


function emailVariables(body) {
    return [{
        name: 'content',
        content: body.content
    }, {
        name: 'contact',
        content: body.contact
    }, {
        name: 'category',
        content: body.category
    }];
}

module.exports = function contactUs(request, response, next) {
    let error = new Error();
    error.errors = validateRequest(request);

    if (Object.keys(error.errors).length) {
        return next(error);
    }

    let to = [{
        email: sendTo
    }];

    email(TEMPLATE, to, emailVariables(request.body))
        .then(() => response.json(success))
        .catch(next);
};
