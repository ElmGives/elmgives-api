'use strict';

let tape = require('tape');
let roundup = require('../../../helpers/roundup');

tape('Round up', test => {
    test.plan(9);

    test.equal(roundup('3.45'), 0.55, '"3.45" round up evaluates to 0.55');
    test.equal(roundup('3.00'), 0, '"3.00" round up evaluates to 0');
    test.equal(roundup('-1.77'), 0.23, '"-1.77" round up evaluates to 0.23');
    test.equal(roundup(3.45), 0.55, '3.45 round up evaluates to 0.55');
    test.equal(roundup(3), 0, '3 round up evaluates to 0');
    test.equal(roundup(-1.77), 0.23, '-1.77 round up evaluates to 0.23');
    test.equal(roundup(1.01), 0.99, '1.01 round up evaluates to 0.99');
    test.equal(roundup(9.99), 0.01, '9.99 round up evaluates to 0.02');
    test.equal(roundup(0), 0, '0 round up evaluates to 0');
});
