/**
 * Generic module to find list of models based on model param
 */
'use strict';

const select = require('../helpers/querySelect');
const querySort = require('../helpers/querySort');

const defaultQuery = {
    archived: false
};

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model, query) => {
    return function list(request, response, next) {

        const fields = select(request.query.fields, Model);
        const sort = querySort(request.query.sort, Model);

        let options = {
            select: fields,
            sort: sort,
            /**
             * Do not return Mongoose models, instead, plain javascript objects
             */
            lean: true,
            limit: 1
        };

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
