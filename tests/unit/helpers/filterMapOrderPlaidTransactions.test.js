'use strict';

const tape = require('tape');
const rAS = require('../../../helpers/roundAndSavePlaidTransaction');
const roundup = require('../../../helpers/roundup');
const filterMapOrder = require('../../../helpers/filterMapOrderPlaidTransactions');

tape('filterMapOrderPlaidTransactions Tests', test => {
    test.plan(3);

    const fakePlaidTransactions = [{
        _id: 'transaction_1',
        amount: 0,
        date: '2016-06-16',
        name: 'Los Nachos',
        _account: 'account_1',
        type: {
            primary: 'place',
        },
        pending: false,
    }, {
        _id: 'transaction_2',
        amount: 3.5,
        date: '2016-06-17',
        name: 'Los Cachos',
        _account: 'account_1',
        type: {
            primary: 'place',
        },
        pending: false,
    }, {
        _id: 'transaction_3',
        amount: 3.5,
        date: '2016-06-17',
        name: 'Los Cachos',
        _account: 'account_2',
        type: {
            primary: 'place',
        },
        pending: false,
    }, {
        _id: 'transaction_4',
        amount: 4.2,
        date: '2016-06-11',
        name: 'Los Pachos',
        _account: 'account_1',
        type: {
            primary: 'place',
        },
        pending: false,
    }];

    const personData = {
        _id: 'user_1',
        plaidAccountId: 'account_1',
    };

    // We mock actual round and save helper, because non zero round ups are saved on DB
    rAS.roundUpAndSave = (personData, transaction) => {
        let roundupValue = roundup(transaction.amount);

        return {
            userId: personData._id,
            transactionId: transaction._id,
            amount: transaction.amount,
            date: (new Date(transaction.date)).toISOString(),
            name: transaction.name,
            roundup: roundupValue,
            summed: false,
        };
    };

    let filteredTransactions = filterMapOrder(fakePlaidTransactions, personData);

    test.equal(filteredTransactions.length, 2, 'Should return transactions with round ups greater than zero');
    test.equal(filteredTransactions[0].transactionId, 'transaction_4', 'Transactions should be in ascending order');
    test.equal(filteredTransactions[1].transactionId, 'transaction_2', 'Valid plaid non zero roundup transactions are needed');

    test.end();
});
