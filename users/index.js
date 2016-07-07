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
const remove = require('./remove');
const adminOrOwner = require('./adminOrOwner');
const validateAccount = require('./validateAccount');
const getBalances = require('./getBalances');
const passwordCode = require('./passwordCode');
const passwordToken = require('./passwordToken');
const passwordValidator = require('../helpers/passwordValidator');
const resetPassword = require('./resetPassword');
const User = require('./user');

const PATH = '/users';
const SINGLE = '/users/:id';
const BALANCES = '/users/:id/balances';
const VERIFICATION = '/users/verification/:token';
const VALIDATE = '/users/validate';

const middlewares = [verifyToken, authenticate, currentUser, isAdmin, create];
const showAdmin = [isAdmin, show];
const updateAdmin = [isAdmin, update];
const updateOwner = [update];
const defaultMiddlewares = [verifyToken, authenticate, currentUser];
const showOwner = [show];

/**
 * For security reasons and uses of REST, we are using POST /users for many
 * purposes. We validate body and based on provided params, execute proper
 * middleware. It could be improved, but, we need to release this quickly.
 */
function validateRequest(request, response, next) {
    const token = request.headers.authorization;

    if (request.body.changePassword && !request.body.code && !request.body.token) {
        /**
         * Send four digits code
         */
        return passwordCode(request, response, next);
    }

    if (request.body.changePassword && request.body.code) {
        /**
         * Send one time token to user to allow him/her to change password
         */
        return passwordToken(request, response, next);
    }

    if (request.body.changePassword && request.body.token) {
        /**
         * Send one time token to user to allow him/her to change password
         */
        return resetPassword(request, response, next);
    }

    /**
     * At this point, it means, an admin user is trying to create an user
     */
    if (token) {
        return customMiddlewares(middlewares, request, response, next);
    }

    /**
     * If the request gets up to this line, means, regular user is trying to
     * create an account.
     */
    return customMiddlewares([create], request, response, next);
}

/**
 * Used as a preliminary check for a valid user before user is actually created
 * Called by the client to verify email & password, but the actual create will
 * not occur until the user agrees with the Terms and Conditions
 *
 * @param request
 * @param response
 * @param next
 */
function validateNewUser( request, response, next ) {
    const defaultResponse = {
        data: {}
    };

    let query = {
        email: request.params.email
    };

    return User
        .findOne(query)
        .then(user => {
            if (user) {
                let error = new Error();
                error.status = 422;
                error.message = 'That email is already in use';

                return Promise.reject(error);
            }

            return passwordValidator(request.body.password);
        })
        .then(() => response.json(defaultResponse))
        .catch(next);
}

router
    .get(VERIFICATION, validateAccount)
    .get(SINGLE, defaultMiddlewares, adminOrOwner(showAdmin, showOwner))
    .get(PATH, defaultMiddlewares, isAdmin, list)
    .get(BALANCES, defaultMiddlewares, getBalances)
    .put(SINGLE, defaultMiddlewares, adminOrOwner(updateAdmin, updateOwner))
    .delete(SINGLE, defaultMiddlewares, isAdmin, remove)
    .post(PATH, validateRequest)
    .post(VALIDATE, validateNewUser);

module.exports = router;
