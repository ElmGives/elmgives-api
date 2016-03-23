/**
 * Generic module to find list of models based on model param
 */
'use strict';

const defaultResponse = require('../helpers/defaultResponse');
const defaultQuery = {
    archived: false
};

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model) => {
    return function list(request, response, next) {
        return Model
            .find(defaultQuery)
            .then(defaultResponse(response))
            .catch(next);
    };
};
