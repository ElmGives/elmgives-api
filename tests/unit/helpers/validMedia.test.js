'use strict';

let tape = require('tape');
let validMedia = require('../../../helpers/validMedia');

tape('Validate images and video arrays', (test) => {
    test.plan(6);

    test.equal(validMedia(''), true, 'proper validMedia');
    test.equal(validMedia([]), true, 'should be valid with empty array');
    test.equal(validMedia([{}]), false, 'invalid media without src');

    test.equal(validMedia([{
        source: 'true',
        order: 1
    }]), true, 'valid with all data');

    test.equal(validMedia([{
        source: ''
    }]), false, 'invalid with empty source');

    test.equal(validMedia([{
        order: ''
    }]), false, 'invalid with empty order');
});
