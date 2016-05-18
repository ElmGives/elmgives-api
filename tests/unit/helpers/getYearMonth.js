'use strict';

const tape = require('tape');
const getYearMonth = require('../../../helpers/getYearMonth');

tape('Get month formatted for address retrieval for pledges', test => {
    test.plan(1);

    let knownDate = '2016-05';
    let testDate = getYearMonth(new Date(knownDate));
    
    test.equal(testDate, knownDate, 'Proper date formatting');
});