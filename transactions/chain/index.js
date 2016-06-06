/**
 * Handle Transaction history requests
 *  get single and list
 */
'use strict';

const router = require('express').Router();
const list = require('./list');
const show = require('./show');
const verifyToken = require('../../lib/verifyJwt');
const authenticate = require('../../lib/authenticate');
const currentUser = require('../../lib/currentUser');
const isAdmin = require('../../lib/isAdmin');

const PATH = '/transactions';
const SINGLE = '/transactions/:hash';

router
    .get(PATH, verifyToken, authenticate, currentUser, isAdmin, list)
    .get(SINGLE, verifyToken, authenticate, currentUser, isAdmin, show);

module.exports = router;
