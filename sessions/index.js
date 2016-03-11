/**
 * Manage Sessions
 *  create
 */
'use strict';

const router = require('express').Router();
const create = require('./create');
const remove = require('./remove');
const verifyToken = require('../lib/verifyJwt');

const PATH = '/sessions';
const SINGLE = '/sessions/:id';

router
    .delete(SINGLE, verifyToken, remove)
    .post(PATH, create);

module.exports = router;
