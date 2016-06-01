/**
 * Helper to validate request information
 */
'use strict';

const emailValidator = require('../helpers/emailValidator');

const categories = {
    suggest: 'suggest',
    comment: 'comment',
    general: 'general'
};

module.exports = function validateRequest(request) {
    let errors = {};

    if (!categories[request.body.category]) {
        errors.category = 'invalid category value';
    }

    if (!request.body.contact) {
        errors.email = 'email required';
    }

    if (!request.body.content) {
        errors.content = 'content required';
    }

    if(!emailValidator(request.body.contact)){
        errors.email = 'invalid email';
    }

    return errors;
};
