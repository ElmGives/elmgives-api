/**
 * Used to add a new transaction (It's not a middelware)
 */
'use strict';

const Transaction = require('./plaidTransaction');

module.exports = (transaction) => {
    return new Transaction(transaction)
        .save()
        .catch(err => console.log(err));
};
