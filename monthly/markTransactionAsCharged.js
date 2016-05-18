'use strict';

const Transactions = require('../transactions/chain/transaction');

/**
 * Sets a transaction property [[charged]] to true
 * @param   {object}    transaction
 * @param   {generator} generator
 */
function markTransactionAsCharged(transaction, generator) {
    const query = {
        'hash.value': transaction.hash.value,
    };
    
    const action = {
        $set: {
            charged: true,
        },
    };
    
    Transactions
        .update(query, action)
        .exec()
        .then(generator.next)
        .catch(generator.throw);
}

module.exports = markTransactionAsCharged;
