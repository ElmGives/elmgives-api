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
const posts = require('./posts');
const images = require('./images');

module.exports = app => {
    app
        .use(images)
        .use(posts)
        .use(sessions)
        .use(charities)
        .use(users)
        .use(banks)
        .use(npos);
};
