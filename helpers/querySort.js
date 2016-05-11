/**
 * Get fields from request.query to be used on `select` to database
 */

'use strict';

module.exports = (fields, Model) => {
    let result = {};
    fields = fields || '';

    fields
        .split(',')
        .map(field => field.trim().split('-'))
        .map(array => {
            let field = array[1] || array[0];

            if (!Model.schema.tree[field]) {
                return;
            }

            result[field] = !!array[1] ? -1 : 1;
        });

    return result;
};
