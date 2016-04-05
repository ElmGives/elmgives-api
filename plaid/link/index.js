/**
 * Manage Plaid Link flow
 */
'use strict';

const router = require('express').Router();
const exchange = require('./exchange');
const verifyToken = require('../../lib/verifyJwt');
const authenticate = require('../../lib/authenticate');
const currentUser = require('../../lib/currentUser');

const PATH = '/plaid/link';

router
    .post(PATH, verifyToken, authenticate, currentUser, exchange)

module.exports = router;
