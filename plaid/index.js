/**
 * Manage Plaid API
 */
'use strict';

const router = require('express').Router();
const plaid = require('plaid');
const P = require('bluebird');

/* Plaid services */
const link = require('./link');
const connect = require('./connect');

/* Plaid client*/
plaid.client = new plaid.Client(
    process.env.PLAID_CLIENTID,
    process.env.PLAID_SECRET,
    process.env.PLAID_ENV
);
P.promisifyAll(plaid.client);

function plaidClient(request, response, next) {
    request.plaid = plaid;
    return next();
}

router
    .use(plaidClient)
    .use(link)
    .use(connect);

module.exports = router;
