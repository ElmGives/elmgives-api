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

const defaultMiddlewares = [verifyToken, authenticate];

router
    .get(PATH, defaultMiddlewares, list(Bank))
    .post(PATH, defaultMiddlewares, create(Bank))
    .get(SINGLE, defaultMiddlewares, show(Bank))
    .put(SINGLE, defaultMiddlewares, update(Bank))
    .delete(SINGLE, defaultMiddlewares, archive(Bank));

module.exports = router;
