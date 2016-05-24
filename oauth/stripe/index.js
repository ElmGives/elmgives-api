/**
 * Manage Plaid Link flow
 */
'use strict';

const router = require('express').Router();
const callback = require('./callback');

const PATH = '/oauth/callback/stripe';

router
    .get(PATH, callback);

module.exports = router;
