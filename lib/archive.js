/**
 * Helper middleware, used to update a document.
 */
'use strict';

const archive = {
    archived: true
};

const defaultResponse = {
    data: {}
};

/**
 * request object
 * response object
 * Model is an instance of mongoose model
 */
module.exports = (Model) => {
    return function remove(request, response, next) {

        let query = {
            _id: request.params.id
        };

        return Model.findOne(Model, query)
            .then(() => Model.update(query, archive))
            .then(() => response.json(defaultResponse))
            .catch(next);
    };
};
