/**
 * Middleware to get single Model
 */
'use strict';

/**
 * Model: it's a mongoose instance model
 * Returns a middleware using Model to query and finde a record
 * Validates ownership and return proper response
 */
module.exports = (Model) => {
    return function show(request, response, next) {
        if (!request.params.id) {
            return response.status(422).json({
                error: 'required params missing'
            });
        }

        let query = {
            _id: request.params.id
        };

        return Model.findOne(query)
            .then(found => {
                if (!found) {
                    let error = new Error();
                    error.status = 404;
                    error.message = 'Resource not found';

                    return next(error);
                }

                return response.json({
                    data: found
                });
            })
            .catch(next);
    };
};
