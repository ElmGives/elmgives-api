/**
 * Generic module to find list of models based on model param
 */
'use strict';

const select = require('../helpers/querySelect');

const defaultQuery = {
    archived: false
};

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model, query) => {
    return function list(request, response, next) {

        const fields = select(request.query.fields, Model);

        let options = {

            /**
             * string separated with blank space, used to `SELECT` from db
             */
            select: fields,

            /**
             * Do not return Mongoose models, instead, plain javascript objects
             */
            lean: true
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
