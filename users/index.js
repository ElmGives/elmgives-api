/**
 * Manage User accounts
 * From admin perspective allow Create/Update/Get/Archive users
 * From owner, Create/Update/Get own information
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
const update = require('./update');
const adminOrOwner = require('./adminOrOwner');

const PATH = '/users';
const SINGLE = '/users/:id';

const middlewares = [verifyToken, authenticate, currentUser, isAdmin, create];
const showAdmin = [isAdmin, show];
const updateAdmin = [isAdmin, update];
const updateOwner = [update];
const defaultMiddlewares = [verifyToken, authenticate, currentUser];
const showOwner = [show];

function adminOrUser(request, response, next) {
    const token = request.headers.authorization;

    if (token) {
        return customMiddlewares(middlewares, request, response, next);
    }

    return customMiddlewares([create], request, response, next);
}

router
    .get(SINGLE, defaultMiddlewares, adminOrOwner(showAdmin, showOwner))
    .get(PATH, defaultMiddlewares, isAdmin, list)
    .put(SINGLE, defaultMiddlewares, adminOrOwner(updateAdmin, updateOwner))
    .post(PATH, adminOrUser);

module.exports = router;
