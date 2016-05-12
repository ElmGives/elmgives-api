/**
 * Generic module to find list of models based on model param
 */
'use strict';

const select = require('../helpers/querySelect');
const querySort = require('../helpers/querySort');

const defaultQuery = {
    archived: false
};

const PER_PAGE = process.env.PER_PAGE || 10;
const PER_PAGE_LIMIT = process.env.PER_PAGE_LIMIT || 50;

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model, query) => {
    return function list(request, response, next) {

        const fields = select(request.query.fields, Model);
        const sort = querySort(request.query.sort, Model);
        const page = request.query.page || 1;
        let perPage = request.query.perPage || PER_PAGE;
        perPage = perPage > PER_PAGE_LIMIT ? PER_PAGE_LIMIT : perPage;

        let options = {
            select: fields,
            sort: sort,
            /**
             * Do not return Mongoose models, instead, plain javascript objects
             */
            lean: true,
            page: page,
            limit: perPage
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
