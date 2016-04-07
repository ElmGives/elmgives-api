'use strict';

let tape = require('tape');
let roundup = require('../../../helpers/roundup');

tape('Round up', test => {
    test.plan(4);

    test.equal(roundup('3.45'), '0.55', 'Should round up to next dollar');
    test.equal(roundup('3.00'), '0', 'Should not round up to next dollar');
    test.equal(roundup(3.45), '0.55', 'Should round up to next dollar');
    test.equal(roundup(3), '0', 'Should not round up to next dollar');
});
