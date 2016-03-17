'use strict';

let tape = require('tape');
let jwt = require('../../../helpers/jwt');
const expected = 'eyJhbGciOiJIUzI1NiJ9.ImZvbyI.1quRKJoDqgv_8FN3_-A0yOVtZl9SmIjbFQW_SSsT83U';

tape('Json Web Token helper', test => {
    test.plan(1);

    jwt('foo', 'bar').then(token => {
        test.equal(token, expected, 'proper json web token');
    });
});
