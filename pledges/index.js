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
const walletAddress = require('./walletAddress');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');

const PATH = '/users/:id/pledges';
const SINGLE = '/users/:id/pledges/:pledgeId';

router
    .get(SINGLE, verifyToken, authenticate, currentUser, single)
    .put(SINGLE, verifyToken, authenticate, currentUser, update)
    .delete(SINGLE, verifyToken, authenticate, currentUser, remove)
    .get(PATH, verifyToken, authenticate, currentUser, list)
    .post(PATH, verifyToken, authenticate, currentUser, create, walletAddress);

module.exports = router;
