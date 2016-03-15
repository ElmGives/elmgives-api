/**
 * Manage Banks
 *  create
 *  update
 *  get single and list
 *  delete
 */
'use strict';

const router = require('express').Router();

const Bank = require('./bank');
const create = require('../lib/create');
const list = require('../lib/list');
const show = require('../lib/show');
const update = require('../lib/update');
const archive = require('../lib/archive');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');

const PATH = '/banks';
const SINGLE = '/banks/:id';

router
    .get(PATH, verifyToken, authenticate, list(Bank))
    .post(PATH, verifyToken, authenticate, create(Bank))
    .get(SINGLE, verifyToken, authenticate, show(Bank))
    .put(SINGLE, verifyToken, authenticate, update(Bank))
    .delete(SINGLE, verifyToken, authenticate, archive(Bank));

module.exports = router;
