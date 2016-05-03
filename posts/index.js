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
const remove = require('./remove');
const update = require('./update');
const list = require('./list');
const show = require('../lib/show');

const PATH = '/posts';
const SINGLE = '/posts/:id';

const defaultMiddlewares = [verifyToken, authenticate, currentUser, isAdmin];

router
    .get(PATH, defaultMiddlewares, list)
    .get(SINGLE, defaultMiddlewares, show(Post))
    .put(SINGLE, defaultMiddlewares, update)
    .delete(SINGLE, defaultMiddlewares, remove)
    .post(PATH, defaultMiddlewares, create);

module.exports = router;
