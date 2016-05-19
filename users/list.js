/**
 * Generic module to find list of models based on model param
 */
'use strict';

const User = require('./user');
const queryOptions = require('../helpers/queryOptions');

const defaultQuery = {
    archived: false
};

module.exports = function list(request, response, next) {
    const options = queryOptions(request, User);

    return User
        .paginate(defaultQuery, options)
        .then(data => {
            let result = data.docs.map(user => {
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                };
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
