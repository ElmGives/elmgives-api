/**
 * Manage Non Profift Organizations
 *  create
 *  update
 *  get single and list
 *  archive
 *  delete
 */
'use strict';

const Npo = require('./npo');
const router = require('express').Router();
const create = require('../lib/create');
const list = require('../lib/list');
const show = require('../lib/show');
const update = require('../lib/update');
const archive = require('../lib/archive');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');

const PATH = '/npos';
const SINGLE = '/npos/:id';

router
    .get(PATH, verifyToken, authenticate, list(Npo))
    .post(PATH, verifyToken, authenticate, create(Npo))
    .get(SINGLE, verifyToken, authenticate, show(Npo))
    .put(SINGLE, verifyToken, authenticate, update(Npo))
    .delete(SINGLE, verifyToken, authenticate, archive(Npo));

module.exports = router;
