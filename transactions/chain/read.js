/**
 * Retrieves one transaction by ID
 * @param  {object}                A query object
 * @return {promise<object|null>}
 */

'use strict';

const Transaction = require('./transaction');
const logger      = require('../../logger');

module.exports = function read(query) {

    if (!query || !Object.keys(query).length) {
        return Promise.reject(new Error('This is an empty query. It must to have a selector'));
    }

	return Transaction
        .findOne(query)
        .catch(logger.error);
};
