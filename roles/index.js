/**
 * Get roles, used to create admin user from admin dashboard
 */

'use strict';

const router = require('express').Router();
const Role = require('./role');

const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');
const isAdmin = require('../lib/isAdmin');

const list = require('../lib/list');

const middlewares = [verifyToken, authenticate, currentUser, isAdmin];

const PATH = '/roles';

router
    .get(PATH, middlewares, list(Role, {}));

module.exports = router;
