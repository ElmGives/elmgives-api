/**
 * Generic module to find list of models based on model param
 */
'use strict';
const queryOptions = require('../helpers/queryOptions');
const defaultQuery = {
    archived: false
};

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model, query) => {
    return function list(request, response, next) {
        const options = queryOptions(request, Model);

        return Model
            .paginate(query || defaultQuery, options)
            .then(data => {
                let result = {
                    data: data.docs
                };

                data.docs = void(0);
                result.meta = data;

                return response.json(result);
            })
            .catch(next);
    };
};
