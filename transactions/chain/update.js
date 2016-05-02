'use strict';

const Transaction = require('./transaction');
const logger = require('../../logger');

module.exports = function updateTransaction(query, newValues) {
    
    if (!query || !newValues) {
        let error = new Error('It is missing a query or new values to update');
        return Promise.reject(error);
    }
    
    return Transaction
        .update(query, newValues)
        .exec()
        .catch(logger.error);
};