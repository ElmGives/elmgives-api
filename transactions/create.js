/**
 * Used to add a new transaction (It's not a middelware)
 */
'use strict';

const Transaction = require('./plaidTransaction');
const logger      = require('../logger');

module.exports = (transaction) => {
    return new Transaction(transaction)
        .save()
        .catch(logger.error);
};
