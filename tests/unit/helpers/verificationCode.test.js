'use strict';

const tape = require('tape');
const code = require('../../../helpers/verificationCode');

tape('Verification Code', test => {
    test.plan(4);
    test.equal(code() >= 1000, true, 'greather than 1000');
    test.equal(code() < 10000, true, 'less than 10000, so we get 4 digits');

    test.equal(code(9, 11) >= 9, true, 'greather than min');
    test.equal(code(9, 11) < 11, true, 'less than max');
});
