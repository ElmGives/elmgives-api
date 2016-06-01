'use strict';

const tape = require('tape');
const getYearMonth = require('../../../helpers/getYearMonth');

tape('Get month year helper', test => {
    test.plan(1);

    const may2016 = new Date(2016, 4);
    
    let actual = getYearMonth(may2016);  
    let expected = '2016-05';
    
    test.equal(actual, expected, 'Proper date formatting');
});
