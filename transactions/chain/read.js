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
        let error = new Error('This is an empty query. It must to have a selector');
        return Promise.reject(error);
    }

	return Transaction
        .findOne(query)
        .exec()
        .then(transaction => {
            
            if (!transaction) {
                let error = new Error('Transaction not found');
                return Promise.reject(error);
            }
            
            return transaction;
        }).catch(logger.error);
};
