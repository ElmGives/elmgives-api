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
const customMiddlewares = require('../lib/customMiddlewares');

const create = require('./create');
const remove = require('./remove');
const update = require('./update');
const list = require('./list');
const show = require('./show');
const postsDashboard = require('./postsDashboard');

const PATH = '/posts';
const SINGLE = '/posts/:id';

const defaultMiddlewares = [verifyToken, authenticate, currentUser];

function validateRequest(request, response, next) {
    if (request.query.dashboard) {
        return postsDashboard(request, response, next);
    }

    return customMiddlewares([isAdmin, list], request, response, next);
}

router
    .get(PATH, defaultMiddlewares, validateRequest)
    .get(SINGLE, defaultMiddlewares, show)
    .put(SINGLE, defaultMiddlewares, update)
    .delete(SINGLE, defaultMiddlewares, remove)
    .post(PATH, defaultMiddlewares, create);

module.exports = router;
