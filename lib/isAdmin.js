/**
 * Middleware validate current user's role
 */

'use strict';

const Role = require('../roles/role');
const admin = require('../helpers/admin');

module.exports = function isAdmin(request, response, next) {
    let currentUser = request.currentUser;

    if (!currentUser || !currentUser.roleId) {
        let error = new Error();
        error.status = 403;
        error.message = 'Forbidden';
        return next(error);
    }

    const query = {
        _id: currentUser.roleId
    };

    Role
        .findOne(query)
        .then(role => {
            if (!role) {
                let error = new Error();
                error.status = 422;
                error.message = 'Resource not found';

                return next(error);
            }

            if (!admin(role)) {
                let error = new Error();
                error.status = 403;
                error.message = 'Forbidden';
                return next(error);
            }
            request.isAdmin = true;
            next();
        })
        .catch(next);
};
