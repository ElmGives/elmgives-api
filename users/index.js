/**
 * Manage User accounts
 *  create
 */
'use strict';

const router = require('express').Router();
const create = require('./create');
const PATH = '/users';

router
    .post(PATH, create);

module.exports = router;
