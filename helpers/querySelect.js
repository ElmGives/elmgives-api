/**
 * Get fields from request.query to be used on `select` to database
 */

'use strict';

module.exports = (fields, Model) => {

    return (fields || '')
        .split(',')
        .filter(field => !!Model.schema.tree[field])
        .join(' ');
};
