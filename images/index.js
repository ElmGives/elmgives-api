/**
 * Upload images to S3
 */
'use strict';

const router = require('express').Router();

const create = require('./create');

const PATH = '/images';

router
    .post(PATH, create);

module.exports = router;
