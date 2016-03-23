/**
 * Require modules and attach them to the application.
 * Basically set new routes for express or you can also mount new express apps
 */
'use strict';

const npos = require('./npos');
const banks = require('./banks');
const users = require('./users');
const charities = require('./charities');
const sessions = require('./sessions');

module.exports = app => {
    app
        .use(sessions)
        .use(charities)
        .use(users)
        .use(banks)
        .use(npos);
};
