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
const create = require('./create');
const list = require('../lib/list');
const show = require('../lib/show');

const PATH = '/posts';
const SINGLE = '/posts/:id';

router
    .get(PATH, verifyToken, authenticate, currentUser, isAdmin, list(Post, {}))
    .get(SINGLE, verifyToken, authenticate, currentUser, isAdmin, show(Post))
    .post(PATH, verifyToken, authenticate, currentUser, isAdmin, create);

module.exports = router;
