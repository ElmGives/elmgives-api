/**
 * Generic module to find list of models based on model param
 */
'use strict';

const User = require('./user');
const queryOptions = require('../helpers/queryOptions');
const queryFilters = require('../helpers/queryFilters');

const defaultQuery = {
    archived: false
};

module.exports = function list(request, response, next) {
    const options = queryOptions(request, User);
    const filterQuery = queryFilters(request, User);
    const query = Object.assign({}, defaultQuery, filterQuery);

    return User
        .paginate(query, options)
        .then(data => {
            let result = data.docs.map(user => {
                user.password = undefined;
                return user;
            });

            let content = {
                data: result
            };

            data.docs = void(0);
            content.meta = data;

            return response.json(content);
        })
        .catch(next);
};
