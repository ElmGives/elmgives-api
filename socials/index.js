/**
 * Manage socials
 *  create
 */
'use strict';

const router = require('express').Router();
const create = require('./create');

const PATH = '/socials';

router
    .post(PATH, create);

module.exports = router;
