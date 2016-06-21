'use strict';

const tape = require('tape');
const getActivePledge = require('../../../monthly/getActivePledge');

tape('getActivePledge Tests', test => {
    test.plan(4);

    try {
        getActivePledge();
    }
    catch(error) {
        test.equal(!!error, true, 'Should throw when we don\'t pass any argument');
    }

    const pledges = [
        {
            bankId: 'one',
            active: false,
            addresses: {},
        },
        {
            bankId: 'two',
            active: true,
            addresses: {},
        },
        {
            bankId: 'three',
            active: false,
            addresses: {},
        },
    ];

    try {
        getActivePledge(pledges);
    }
    catch(error) {
        test.equal(!!error, true, 'Should throw when we don\'t pass user ID');
    }

    const userId = 'userId';

    const pledgesWithError = [
        {
            bankId: 'one',
            active: false,
            addresses: {},
        },
        {
            bankId: 'three',
            active: false,
            addresses: {},
        },
    ];

    try {
        getActivePledge(pledgesWithError, userId);
    }
    catch(error) {
        test.equal(error.message, 'active-pledge-not-found', 'Should throw when there is no pledges active');
    }

    let activePledge = getActivePledge(pledges, userId);

    test.equal(activePledge.bankId, 'two', 'Should have a valid property from activePledge');

    test.end();
});