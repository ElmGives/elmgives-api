/**
 * Manage Plaid Connect flow
 *  addConnectUser
 *  stepConnectUser
 *  patchConnectUser
 *  getConnectUser
 */
'use strict';

const router = require('express').Router();
const add = require('./add');
const get = require('./get');
const step = require('./step');
const patch = require('./patch');
const _delete = require('./delete');
const verifyToken = require('../../lib/verifyJwt');
const authenticate = require('../../lib/authenticate');
const currentUser = require('../../lib/currentUser');

const PATH = '/plaid/connect';
const STEP = '/plaid/connect/step';

router
    .post(PATH, verifyToken, authenticate, currentUser, add)
    .post(STEP, verifyToken, authenticate, currentUser, step)
    .get(PATH, verifyToken, authenticate, currentUser, get)
    .put(PATH, verifyToken, authenticate, currentUser, patch)
    .delete(PATH, verifyToken, authenticate, currentUser, _delete);

module.exports = router;
