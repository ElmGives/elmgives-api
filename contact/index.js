/**
 * Get roles, used to create admin user from admin dashboard
 */

'use strict';

const router = require('express').Router();
const create = require('./create');
const PATH = '/contact';

router
    .post(PATH, create);

module.exports = router;
