/**
 * Manage Plaid API
 */
'use strict';

const router = require('express').Router();

/* Plaid services */
const connect = require('./connect');

router
    .use(connect);

module.exports = router;
