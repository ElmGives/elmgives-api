/**
 * Set properties and prepare user to be 'deleted' which means archived
 */

'use strict';

const hat = require('hat');

module.exports = function prepareDelete(user) {
    let email = user.email.split('@');
    email = `${email[0]}+${hat()}@${email[1]}`;
    user.archived = true;
    user.active = false;
    user.email = email;

    return user;
};
