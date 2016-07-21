/**
 * As per requirements, return:
 *     latests post for Post's nodes ( A -> E ) with:
 *     npo => _id, logo, background, name, videos, images
 *
 * Response expected:
 *
 * {
 *     data: [
 *         {node: A, ..},
 *         {node: B, ..},
 *         {node: C, ..},
 *         {node: D, ..},
 *         {node: E, ..},
 *     ]
 * }
 */

'use strict';

const Post = require('./post');
const LIMIT_POST_DAHSHBOARD = process.env.LIMIT_POST_DAHSHBOARD || 1;

/**
 * Default values for query on posts
 */
const nodes = ['A', 'B', 'C', 'D', 'E'];
const select = '_id npoId videos images node available';
const npoSelect = '_id logoUrl backgroundColor node';
const sort = {
    createdAt: -1
};

function mapData(data) {
    /**
     * Current requirement is to return a single post, that's why
     * LIMIT_POST_DASHBOARD is set to 1, besides, doing `item[0]` will pick only
     * the first post
     */
    return {
        data: data.map(item => item[0] || {})
    };
}

module.exports = function dashboard(request, response, next) {
    let pledge = request.currentUser.pledges.find(item => item.active);
    let npoId = typeof pledge === 'object' ? pledge.npoId : request.query.npoId;

    let promises = nodes.map(node => {
        let query = {
            node: node
        };
        if (npoId) {query.npoId = npoId;}

        return Post
            .find(query, select)
            .sort(sort)
            .limit(LIMIT_POST_DAHSHBOARD)
            .populate('npoId', npoSelect);
    });

    /**
     * Currently using 5 queries. It could use Post.aggregate but it will
     * require knowledge to maintain this. It's easy to just use regular queries
     * This content will be cached
     */
    Promise
        .all(promises)
        .then(data => response.json(mapData(data)))
        .catch(next);
};
