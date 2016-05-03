/**
 * Generic module to find list of models based on model param
 */
'use strict';

const defaultQuery = {
    archived: false
};

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model, query) => {
    return function list(request, response, next) {
        return Model
            .find(query || defaultQuery)
            .then(data => {
                return response.json({
                    data: data
                });
            })
            .catch(next);
    };
};
