/**
 * Generic module to find list of models based on model param
 */
'use strict';

const error = require('./error');

/**
 * Model is an instance of mongoose model
 */
module.exports = (Model) => {
    return (request, response) => {
        return Model
            .find({})
            .then(data => {
                return response.json({
                    data: data
                });
            })
            .catch(error(response));
    };
};
