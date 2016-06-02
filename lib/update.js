/**
 * Helper middleware, used to update a document.
 */
'use strict';

const options = {
    runValidators: true
};

/**
 * request object
 * response object
 * Model is an instance of mongoose model
 */
module.exports = (Model) => {
    return function update(request, response, next) {

        let query = {
            _id: request.params.id
        };

        return Model.findOne(query)
            .then(() => Model.update(query, request.body, options))
            .then(() => response.json({
                data: {}
            }))
            .catch(next);
    };
};
