/**
 * Get list of posts with populated content from NPO's
 * Paginated data,
 * Filter by npoId
 */
'use strict';

const Post = require('./post');
const queryOptions = require('../helpers/queryOptions');

const defaultQuery = {
    archived: false
};

module.exports = function list(request, response, next) {
    let query;
    const options = queryOptions(request, Post);

    /**
     * @see http://mongoosejs.com/docs/api.html#query_Query-populate
     */
    options.populate = {
        path: 'npoId',
        select: 'name'
    };

    if (request.query.npoId) {
        query = {};
        query.npoId = request.query.npoId;
    }

    return Post
        .paginate(query || defaultQuery, options)
        .then(data => {
            let result = {
                data: data.docs
            };

            data.docs = undefined;
            result.meta = data;
            return response.json(result);
        })
        .catch(next);
};
