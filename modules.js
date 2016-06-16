/**
 * Require modules and attach them to the application.
 * Basically set new routes for express or you can also mount new express apps
 */
'use strict';

const npos = require('./npos');
const banks = require('./banks');
const users = require('./users');
const plaid = require('./plaid');
const pledges = require('./pledges');
const sessions = require('./sessions');
const posts = require('./posts');
const images = require('./images');
const roles = require('./roles');
const socials = require('./socials');
const oauth = require('./oauth');
const contact = require('./contact');
const transactions = require('./transactions/chain');
const status = require('./heartbeat');

module.exports = app => {
    app
        .use(oauth)
        .use(images)
        .use(roles)
        .use(posts)
        .use(sessions)
        .use(pledges)
        .use(plaid)
        .use(users)
        .use(transactions)
        .use(banks)
        .use(socials)
        .use(contact)
        .use(status)
        .use(npos);
};
