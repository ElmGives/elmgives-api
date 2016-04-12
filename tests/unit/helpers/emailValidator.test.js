'use strict';

let tape = require('tape');
let email = require('../../../helpers/emailValidator');

tape('Validate emails', (test) => {
    test.plan(6);

    test.equal(email('f@f.c'), true, 'proper email');
    test.equal(email('@f.c'), false, 'invalid email withgout start word');
    test.equal(email('foo.c'), false, 'invalid email without @');
    test.equal(email('foo'), false, 'invalid email with just a word');
    test.equal(email(''), false, 'invalid email with empty values');
    test.equal(email('foo@'), false, 'invalid email without .somethingelse');
});
