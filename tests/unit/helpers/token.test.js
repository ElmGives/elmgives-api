'use strict';

let tape = require('tape');
let token = require('../../../helpers/token');

tape('Token helper', test => {
    test.plan(3);

    test.equal(token().length, 32, 'valid token length');
    test.notEqual(token(), '', 'should not be empty string');
    test.notEqual(typeof token(), 'String', 'should return a string');
});
