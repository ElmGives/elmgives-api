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
module.exports = (Model, query) => {
    return function list(request, response, next) {

        if(request.query.npoId){
            query.npoId = request.query.npoId;
        }

        return Model
            .find(query || defaultQuery)
            .then(defaultResponse(response))
            .catch(next);
    };
};
