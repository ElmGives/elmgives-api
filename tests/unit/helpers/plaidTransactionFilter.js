'use strict';

let tape = require('tape');
let plaidTransaction = require('../../../helpers/plaidTransactionFilter');

tape('Plaid Transaction filter', test => {
    test.plan(5);

    test.equal(plaidTransaction(), false, 'Should return false when no arguments');

    const transactionOne = {
        typePrimary: 'place',
        pending    : false,
    };

    test.equal(plaidTransaction(transactionOne), true, 'Should return true when a valid transaction');

    const transactionTwo = {
        typePrimary: 'digital',
        pending    : false,
    };

    test.equal(plaidTransaction(transactionTwo), true, 'Should return true when a valid transaction');

    const transactionThree = {
        typePrimary: 'place',
        pending    : true,
    };

    test.equal(plaidTransaction(transactionThree), false, 'Should return false when a pending transaction');

    const transactionFor = {
        typePrimary: 'other',
        pending    : false,
    };

    test.equal(plaidTransaction(transactionFor), false, 'Should return false when is a different type of transaction');
});
