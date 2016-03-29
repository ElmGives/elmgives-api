/**
 * Manage posts
 *  create
 *  update
 *  get single and list
 *  delete
 */
'use strict';

const router = require('express').Router();

const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');
const isAdmin = require('../lib/isAdmin');

const Post = require('./post');
const create = require('../lib/create');

const PATH = '/posts';

router
    .post(PATH, verifyToken, authenticate, currentUser, isAdmin, create(Post));

module.exports = router;
