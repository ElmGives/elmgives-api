'use strict';

const tape = require('tape');
const getPastAddresses = require('../../../monthly/getPastAddresses');

tape('getPastAddresses Tests', test => {
    test.plan(12);

    try {
        getPastAddresses();
    }
    catch(error) {
        test.equal(!!error, true, 'Should throw if no parameters provided');
    }

    let activePledge = {};

    try {
        getPastAddresses(activePledge);
    }
    catch(error) {
        test.equal(!!error, true, 'Should throw if no addresses property found on activePledge');
    }

    let date = new Date();
    let thisMonth = `${date.getFullYear()}-${parseMonthToString(date.getMonth())}`;

    test.equal(/\d{4}\-\d{2}/.test(thisMonth), true, 'Should have the proper format yyyy-mm');

    activePledge = {
        addresses: {}
    };

    activePledge.addresses[ thisMonth ] = 'thismonthtoken';

    let result = getPastAddresses(activePledge);

    test.equal(result.length, 0, 'Should have no result');

    date.setMonth(date.getMonth() - 1);
    let lastMonth = `${date.getFullYear()}-${parseMonthToString(date.getMonth())}`;

    activePledge.addresses[ lastMonth ] = 'lastmonthtoken';
    result = getPastAddresses(activePledge);

    test.equal(result.length, 1, 'Should have one result');
    test.equal(result[0], 'lastmonthtoken', 'Should have one result');

    date.setMonth(date.getMonth() - 1);
    let twoMonths = `${date.getFullYear()}-${parseMonthToString(date.getMonth())}`;

    activePledge.addresses[ twoMonths ] = 'twomonthtoken';
    result = getPastAddresses(activePledge);

    test.equal(result.length, 2, 'Should have two results');
    test.equal(result[0], 'lastmonthtoken', 'Should have two results');
    test.equal(result[1], 'twomonthtoken', 'Should have two results');

    date.setMonth(date.getMonth() - 1);
    let threeMonths = `${date.getFullYear()}-${parseMonthToString(date.getMonth())}`;

    activePledge.addresses[ threeMonths ] = 'threemonthtoken';
    result = getPastAddresses(activePledge);

    test.equal(result.length, 2, 'Should remain with two results');
    test.equal(result[0], 'lastmonthtoken', 'Should remain with two results');
    test.equal(result[1], 'twomonthtoken', 'Should remain with two results');

    test.end();
});

function parseMonthToString(month) {
    let monthCorrected = month + 1;

    return monthCorrected < 10 ? '0' + monthCorrected : monthCorrected;
}