'use strict';

const roundup = require('./roundup');
const createPlaidTransaction = require('../transactions/create');

/**
 * Takes a transaction, rounds up the amount and save this as a plaidTransaction for later processing
 * @param {string} personData
 * @param {object} transaction
 */
function roundUpAndSave(personData, transaction) {
    let roundupValue = roundup(transaction.amount);

    let plaidTransaction = {
        userId: personData._id,
        transactionId: transaction._id,
        amount: transaction.amount,
        date: (new Date(transaction.date)).toISOString(),
        name: transaction.name,
        roundup: roundupValue,
        summed: false,    // This one is to know if we have already ran the process on this transaction
    };

    if (roundupValue) {
        createPlaidTransaction(plaidTransaction);
    }

    return plaidTransaction;
}

module.exports = { 
    roundUpAndSave: roundUpAndSave,
};
