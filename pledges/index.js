/**
 * Manage User's NPO's
 */
'use strict';

const router = require('express').Router();
const create = require('./create');
const update = require('./update');
const remove = require('./remove');
const list = require('./list');
const single = require('./single');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');

const PATH = '/users/:id/pledges';
const SINGLE = '/users/:id/pledges/:pledgeId';

/* Plaid client*/
const plaid = require('plaid');
plaid.client = new plaid.Client(
    process.env.PLAID_CLIENTID,
    process.env.PLAID_SECRET,
    process.env.PLAID_ENV
);

function plaidClient(request, response, next) {
    request.plaid = plaid;
    return next();
}

router
    .use(plaidClient)
    .get(SINGLE, verifyToken, authenticate, currentUser, single)
    .put(SINGLE, verifyToken, authenticate, currentUser, update)
    .delete(SINGLE, verifyToken, authenticate, currentUser, remove)
    .get(PATH, verifyToken, authenticate, currentUser, list)
    .post(PATH, verifyToken, authenticate, currentUser, create);

module.exports = router;
