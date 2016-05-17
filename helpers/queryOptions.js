/**
 * Get fields from request.query to be used on `select` to database
 */

'use strict';
const select = require('../helpers/querySelect');
const querySort = require('../helpers/querySort');

const PER_PAGE = process.env.PER_PAGE || 10;
const PER_PAGE_LIMIT = process.env.PER_PAGE_LIMIT || 50;

module.exports = (request, Model) => {
        const fields = select(request.query.fields, Model);
        const sort = querySort(request.query.sort, Model);
        const page = request.query.page || 1;
        let perPage = request.query.perPage || PER_PAGE;
        perPage = perPage > PER_PAGE_LIMIT ? PER_PAGE_LIMIT : perPage;

        return {
            select: fields,
            sort: sort,
            /**
             * Do not return Mongoose models, instead, plain javascript objects
             */
            lean: true,
            page: page,
            limit: perPage
        };
};
