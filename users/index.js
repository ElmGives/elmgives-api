/**
 * Manage User accounts
 *  create
 */
'use strict';

const router = require('express').Router();
const customMiddlewares = require('../lib/customMiddlewares');
const verifyToken = require('../lib/verifyJwt');
const authenticate = require('../lib/authenticate');
const currentUser = require('../lib/currentUser');
const isAdmin = require('../lib/isAdmin');
const create = require('./create');
const list = require('./list');
const show = require('./show');

const PATH = '/users';
const SINGLE = '/users/:id';

const middlewares = [
    verifyToken, authenticate, currentUser, isAdmin, create
];

function adminOrUser(request, response, next) {
    const token = request.headers.authorization;

    if (token) {
        return customMiddlewares(middlewares, request, response, next);
    }

    return customMiddlewares([create], request, response, next);
}

router
    .get(SINGLE, verifyToken, authenticate, currentUser, isAdmin, show)
    .get(PATH, verifyToken, authenticate, currentUser, isAdmin, list)
    .post(PATH, adminOrUser);

module.exports = router;
