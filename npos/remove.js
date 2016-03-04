/**
 * Helper middleware, used to update a document.
 */
'use strict';

let error = require('../lib/error');

/**
 * request object
 * response object
 * Model is an instance of mongoose model
 */
module.exports = (Model) => {
    return (request, response) => {

        let query = {
            _id: request.params.id
        };

        return Model.findOne(Model, query)
            .then(( /*we are good to update doc*/ ) => {
                return Model.update(query, {
                    archived: true
                });
            })
            .then(( /*updated*/ ) => response.send())
            .catch(error(response));
    };
};
