/**
 * Seed database with default values, for development purposes
 */
'use strict';

require('../app');
const Transaction = require('../transactions/chain/transaction');
let transactions = require('./transactions.json');

let findOrInsert = (data) => {

    const query = {
        'hash.value': data.hash.value
    };

    return Transaction
        .findOne(query)
        .then(transaction => transaction ? transaction : new Transaction(data).save())
        .catch(error => error);
};

function all(promises) {
    Promise
        .all(promises)
        .then(values => {
            values.map(transaction => console.log(`transaction found/created ${transaction.hash.value}`));
            process.exit(0);
        }, reason => {
            console.log(reason);
            process.exit(1);
        });
}

let promises = transactions.map(transaction => findOrInsert(transaction));
all(promises);
