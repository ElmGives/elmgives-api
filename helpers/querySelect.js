/**
 * Get fields from request.query to be used on `Model.paginate`
 */

'use strict';

module.exports = (fields, Model) => {

    return (fields || '')
        .split(',')
        .map(field => field.trim())
        .filter(field => !!Model.schema.tree[field])
        .join(' ');
};
