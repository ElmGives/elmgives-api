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

const PATH = '/banks';
const SINGLE = '/banks/:id';

router
    .get(PATH, list(Bank))
    .post(PATH, create(Bank))
    .get(SINGLE, show(Bank))
    .put(SINGLE, update(Bank))
    .delete(SINGLE, archive(Bank));

module.exports = router;
