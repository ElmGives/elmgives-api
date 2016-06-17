'use strict';

let tape = require('tape');
let plaidTransaction = require('../../../helpers/plaidTransactionFilter');

tape('Plaid Transaction filter', test => {
    test.plan(5);

    const accountId = 'kshsajkdh';

    test.equal(plaidTransaction(), false, 'Should return false when no arguments');

    const transactionOne = {
        _account: accountId,
        type: {
            primary: 'place',
        },
        pending    : false,
    };

    test.equal(plaidTransaction(accountId, transactionOne), true, 'Should return true when a valid transaction');

    const transactionTwo = {
        _account: accountId,
        type: {
            primary: 'digital',
        },
        pending    : false,
    };

    test.equal(plaidTransaction(accountId, transactionTwo), true, 'Should return true when a valid transaction');

    const transactionThree = {
        _account: accountId,
        type: {
            primary: 'place',
        },
        pending    : true,
    };

    test.equal(plaidTransaction(accountId, transactionThree), false, 'Should return false when a pending transaction');

    const transactionFor = {
        _account: accountId,
        type: {
            primary: 'other',
        },
        pending    : false,
    };

    test.equal(plaidTransaction(accountId, transactionFor), false, 'Should return false when is a different type of transaction');
});
