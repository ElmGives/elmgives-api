'use strict';

let tape = require('tape');
let padNumber = require('../../../helpers/padNumber');

tape('Pad Number', test => {
    test.plan(2);

    test.equal(padNumber(2), '02', 'Should add one zero leading this number');
    test.equal(padNumber(11), '11', 'Should not add one zero leading this number and return a string');
});
 