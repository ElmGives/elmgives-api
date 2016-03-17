/**
 * Middleware to get single Model
 */
'use strict';

let error = require('../lib/error');

/**
 * Model: it's a mongoose instance model
 * Returns a middleware using Model to query and finde a record
 * Validates ownership and return proper response
 */
module.exports = (Model) => {
    return (request, response) => {
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
                    return response.status(404).send();
                }
                return response.json(found);
            })
            .catch(error(response));
    };
};
