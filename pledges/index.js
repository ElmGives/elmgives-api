/**
 * Manage User's NPO's
 */
'use strict';

const router = require('express').Router();
const create = require('./create');
const update = require('./update');
const list = require('./list');
const single = require('./single');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');
const transactionHistory = require('./transactionHistory');

const PATH = '/users/:id/pledges';
const SINGLE = '/users/:id/pledges/:pledgeId';
const TRANSACTIONS = '/users/:id/pledges/:pledgeId/transactions';

router
    .get(SINGLE, verifyToken, authenticate, currentUser, single)
    .put(SINGLE, verifyToken, authenticate, currentUser, update)
    .get(PATH, verifyToken, authenticate, currentUser, list)
    .post(PATH, verifyToken, authenticate, currentUser, create)
    .get(TRANSACTIONS, verifyToken, authenticate, currentUser, transactionHistory);

module.exports = router;
