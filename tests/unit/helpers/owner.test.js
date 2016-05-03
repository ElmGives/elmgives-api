'use strict';

let tape = require('tape');
let owner = require('../../../helpers/owner');

tape('Owner helper', test => {
    test.plan(5);

    test.equal(owner(), false, 'require current user and userId');
    test.equal(owner(''), false, 'require current user and userId');
    test.equal(owner('foobar', ''), false, 'require current user and userId');
    test.equal(owner('foobar', 'foobar'), true, 'true with same values');
    test.equal(owner(123, 123), true, 'true with same values');
});
