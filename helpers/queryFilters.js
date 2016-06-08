/**
 * Get fields from request.query to be used on `Model.paginate`
 */

'use strict';

module.exports = (request, Model) => {
    const modelSchemaTree = Model.schema.tree;
    const filters = Object.keys(request.query.filter || {});
    const filterBy = filters.reduce((reduced, key, index) => {
      if (key in modelSchemaTree) {
        let filter = request.query.filter[key];
        if (typeof filter === 'string') {
          reduced[key] = new RegExp(`^${filter}`);
        } else {
          reduced[key] = filter;
        }
      }
      return reduced;
    }, {});

    return filterBy;
};
