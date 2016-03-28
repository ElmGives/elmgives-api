/**
 * Manage User accounts
 *  create
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');
const isAdmin = require('../lib/isAdmin');
const create = require('./create');
const list = require('./list');

const PATH = '/users';

router
    .get(PATH, verifyToken, authenticate, currentUser, isAdmin, list)
    .post(PATH, create);

module.exports = router;
