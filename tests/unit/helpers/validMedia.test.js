'use strict';

let tape = require('tape');
let validMedia = require('../../../helpers/validMedia');

tape('Validate images and video arrays', (test) => {
    test.plan(9);

    test.equal(validMedia(''), true, 'proper validMedia');
    test.equal(validMedia([]), true, 'should be valid with empty array');
    test.equal(validMedia([{}], 'images'), false, 'invalid images without src');
    test.equal(validMedia([{}], 'videos'), false, 'invalid videos without src');

    test.equal(validMedia([{
        source: 'true',
        order: 1
    }], 'images'), true, 'valid with all data');

    test.equal(validMedia([{
        source: ''
    }], 'images'), false, 'invalid with empty source');

    test.equal(validMedia([{
        order: ''
    }], 'images'), false, 'invalid with empty order');

    test.equal(validMedia([{
        shareUrl: ''
    }], 'videos'), false, 'invalid without video shareUrl');

    test.equal(validMedia([{
        shareUrl: 'foobar',
        order: 1,
        source: 'foobar'
    }], 'videos'), true, 'valid with proper video values');
});
