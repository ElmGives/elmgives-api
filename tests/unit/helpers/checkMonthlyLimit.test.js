'use strict';

let tape = require('tape');
let checkMonthlyLimit = require('../../../helpers/checkMonthlyLimit');

tape('Clamp to user monthly limit', test => {
    test.plan(2);
    
    const fakeUserData = {
        limit: 5.00,
    };
    
    const fakePlaidTransactions = [{
        roundup: 3,
    }, {
        roundup: 6,
    }];
    
    const fakePreviousChain = {
        'hash': {
            'type': 'sha256',
            'value': 'ef79244cda4d2204cf298b236d994f8684e3dc2438208f2eba598850f3463b69'
        },
        'payload': {
            'count': 0,
            'address': 'wiBUPYaaaF3QYhvWmu1bgjJavpuvhSfYmU',
            'amount': 0,
            'roundup': 0,
            'balance': 0,
            'currency': 'USD',
            'limit': -10,
            'previous': null,
            'timestamp': '2016-03-01T12:00:00.000Z',
            'reference': 'plaid_transaction_id'
        },
        'signatures': [{
            'header': {
                'alg': 'ed25519',
                'kid': 'wiBUPYaaaF3QYhvWmu1bgjJavpuvhSfYmU'
            },
            'signature': '304402200bc24dcef4aff22402c7c26d4431074647d308642d401e98c9d30d3e314174f002200b21829db5e2478712f09045a20b1cdc5084d9ecd0c37914ffbf2bf03a4bad22'
        }],
    };
    
    let expected = 1;
    let actual = checkMonthlyLimit(fakeUserData, fakePlaidTransactions, fakePreviousChain)[1].length;
    
    test.equal(actual, expected, 'New plaid transactions should be less because 3.00 + 6.00 = 9.00 and limit is 5.00');
    
    fakePlaidTransactions.push({ roundup: 1.00 });
    
    expected = 2;
    actual = checkMonthlyLimit(fakeUserData, fakePlaidTransactions, fakePreviousChain)[1].length;
    
    test.equal(actual, expected, 'New plaid transactions should not discard a plaid transaction if it is still under the monthly limit');
});