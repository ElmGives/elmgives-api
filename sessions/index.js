/**
 * Manage Sessions
 *  create
 */
'use strict';

const router = require('express').Router();
const create = require('./create');

const PATH = '/sessions';

router
    .post(PATH, create);

module.exports = router;
