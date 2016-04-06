/**
 * Helper middleware, used to update a document.
 */
'use strict';

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
            .then(() => {
                /**
                 * we are good to update doc
                 */
                return Model.update(query, {
                    archived: true
                });
            })
            .then(( /*updated*/ ) => response.send())
            .catch(next);
    };
};
