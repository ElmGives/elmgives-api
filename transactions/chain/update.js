'use strict';

const Transaction = require('./transaction');
const logger = require('../../logger');

module.exports = function updateTransaction(query, newValues) {
    
    if (!query || !newValues) {
        return Promise.reject('It is missing a query or new values to update');
    }
    
    return Transaction
        .update(query, newValues)
        .exec()
        .catch(logger.error);
};