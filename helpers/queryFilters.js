/**
 * Get fields from request.query to be used on `Model.paginate`
 * Used to prepare query object
 */
'use strict';

module.exports = (request, Model) => {
    const properties = Model.schema.paths;

    return Object
        .keys(request.query.filter || {})
        .reduce((previous, current) => {

            const value = request.query.filter[current];

            if (properties[current] && value) {
                /**
                 * Filter by instance type,
                 * By default, string will use a regex to search
                 * TODO: Refactor to use proper helpers for each type
                 */
                if (properties[current].instance === 'String') {
                    previous[current] = new RegExp(`^${value}`);
                } else {
                    previous[current] = value;
                }
            }

            return previous;
        }, {});
};
