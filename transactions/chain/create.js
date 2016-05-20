/**
 *
 */
'use strict';

const Transaction = require('./transaction');
const logger      = require('../../logger');

module.exports = function createTransaction(transaction) {

    if (!transaction) {
        return Promise.reject('There is no Transaction to save');
    }

    return new Transaction(transaction)
        .save()
        .catch(logger.error);
};
