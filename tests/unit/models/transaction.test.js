'use strict';

const tape = require('tape');
const Transaction = require('../../../transactions/chain/transaction');
const types = require('../types');
const required = require('../required');

let requiredFields = ['count', 'amount', 'roundup', 'balance', 'currency', 'limit', 'timestamp', 'reference']
    .map(property => 'payload.' + property);
requiredFields.push('hash.value');
let numberFields = ['count', 'amount', 'roundup', 'balance', 'limit']
    .map(property => 'payload.' + property);
let stringFields = ['address', 'currency', 'previous', 'timestamp', 'reference', 'info']
    .map(property => 'payload.' + property);
stringFields.push('hash.type');
stringFields.push('hash.value');

tape('Transaction model', test => {
    test.plan(1 + requiredFields.length + numberFields.length + stringFields.length);

    let transaction = new Transaction({});
    let values = transaction.schema.paths;

    types(numberFields, values, test, 'Number');
    types(stringFields, values, test, 'String');

    transaction.validate(error => {
        required(requiredFields, error.errors, test);
    });

    new Transaction({
        hash: {
            type: 'sha256',
            value: '1bd28a7ec31c9dae34c8ea7f6e138df19be66d2e843fe51082e6eabaac7ae37c'
        },
        payload: {
            count: 0,
            address: 'wYAAm2TQ8ToXJAUVQFrmZQJR3pnBYcwxuL',
            amount: 0,
            roundup: 0,
            balance: 0,
            currency: 'USD',
            limit: -10,
            previous: null,
            timestamp: 'Sat Apr 09 2016 08:14:07 GMT-0500 (COT)',
            reference: 'plaid_transaction_id'
        },
        signatures: []
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
