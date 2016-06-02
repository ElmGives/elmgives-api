/**
 * Run some middlewares based on admin user or owner
 * If current user is not and admin neigther the owner of the information
 * return not authorized with proper middleware chain
 */
'use strict';

const owner = require('../helpers/owner');
const customMiddlewares = require('../lib/customMiddlewares');

/**
 * Admin middlewares should include `isAdmin` middleware
 */
module.exports = (adminMiddlewares, ownerMiddlewares) => {
    return function adminOrOwner(request, response, next) {
        let user = request.currentUser || {};

        if (owner(user._id, request.params.id)) {
            return customMiddlewares(ownerMiddlewares, request, response, next);
        }

        return customMiddlewares(adminMiddlewares, request, response, next);
    };
};
