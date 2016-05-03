/**
 * Middleware to get single User information
 */
'use strict';
const User = require('./user');

module.exports = function show(request, response, next) {
    if (!request.params.id) {
        return response.status(422).json({
            error: 'required params missing'
        });
    }

    let query = {
        _id: request.params.id
    };

    return User
        .findOne(query)
        .then(found => {
            if (!found) {
                let error = new Error();
                error.status = 404;
                error.message = 'Resource not found';
                return next(error);
            }

            return response.json({
                data: {
                    name: found.name,
                    email: found.email,
                    _id: found._id
                }
            });
        })
        .catch(next);
};
