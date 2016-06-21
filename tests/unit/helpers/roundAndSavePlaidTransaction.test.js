'use strict';

/**
 * We make amout zero because this value doesn't make a call to [[creeatePlaidTransaction]] wich is a call to database
 */

const tape = require('tape');
const rAS = require('../../../helpers/roundAndSavePlaidTransaction');

tape('roundAndSavePlaidTransaction Test', test => {
    test.plan(6);

    const transaction = {
        _id: 'transaction_1',
        amount: 0,
        date: '2016-06-16',
        name: 'Los Nachos',
    };

    const personData = {
        _id: 'user_1',
    };

    let plaidTransaction = rAS.roundUpAndSave(personData, transaction);

    test.equal(plaidTransaction.userId, personData._id, 'User Id matches on plaidTransaction');
    test.equal(plaidTransaction.transactionId, transaction._id, 'Transaction Id matches on plaidTransaction');
    test.equal(plaidTransaction.amount, transaction.amount, 'Transaction amount matches on plaidTransaction');
    test.equal(plaidTransaction.date, '2016-06-16T00:00:00.000Z', 'Transaction date matches on plaidTransaction');
    test.equal(plaidTransaction.name, transaction.name, 'Transaction name matches on plaidTransaction');
    test.equal(plaidTransaction.roundup, 0, 'Transaction roundup should be zero');

    test.end();
});