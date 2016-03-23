/**
 * Manage User's NPO's
 */
'use strict';

const router = require('express').Router();
const create = require('./create');
const list = require('./list');
const single = require('./single');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');

const PATH = '/users/:id/charities';
const SINGLE = '/users/:id/charities/:charityId';

router
    .get(SINGLE, verifyToken, authenticate, currentUser, single)
    .get(PATH, verifyToken, authenticate, currentUser, list)
    .post(PATH, verifyToken, authenticate, currentUser, create);

module.exports = router;
