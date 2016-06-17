/**
 * Get roles, used to create admin user from admin dashboard
 */

'use strict';

const router = require('express').Router();
const PATH = '/status';
const status = require('./status');

router
    .get(PATH, status);

module.exports = router;
