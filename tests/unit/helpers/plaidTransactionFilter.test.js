'use strict';

let tape = require('tape');
let plaidTransaction = require('../../../helpers/plaidTransactionFilter');

tape('Plaid Transaction filter', test => {
    test.plan(6);

    const accountId = 'kshsajkdh';

    test.equal(plaidTransaction(), false, 'Should return false when no arguments');

    const transactionOne = {
        _account: accountId,
        amount: 0.99,
        type: {
            primary: 'place',
        },
        pending: false,
    };

    test.equal(plaidTransaction(accountId, transactionOne), true, 'Should return true when a valid transaction');

    const transactionTwo = {
        _account: accountId,
        amount: 0.99,
        type: {
            primary: 'digital',
        },
        pending: false,
    };

    test.equal(plaidTransaction(accountId, transactionTwo), true, 'Should return true when a valid transaction');

    const transactionThree = {
        _account: accountId,
        amount: 0.99,
        type: {
            primary: 'place',
        },
        pending: true,
    };

    test.equal(plaidTransaction(accountId, transactionThree), false, 'Should return false when a pending transaction');

    const transactionFour = {
        _account: accountId,
        amount: 0.99,
        type: {
            primary: 'other',
        },
        pending: false,
    };

    test.equal(plaidTransaction(accountId, transactionFour), true, 'Should return true for any type of transaction');

    const transactionFive = {
        _account: accountId,
        amount: -0.99,
        type: {
            primary: 'other',
        },
        pending: false,
    };

    test.equal(plaidTransaction(accountId, transactionFive), false, 'Should return false for negative transaction amounts');
});
