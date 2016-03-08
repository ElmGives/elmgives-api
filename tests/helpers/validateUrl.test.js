'use strict';

let tape = require('tape');
let validate = require('../../helpers/validateUrl');

tape('Validate url helper validator', (test) => {
    test.plan(5);

    let url = 'http://localhost/img.jpg';

    test.equal(validate(url), true, 'proper url');
    test.equal(validate(''), false, 'invalid url with empty value');
    test.equal(validate('http://'), false, 'invalid url with just protocol');
    test.equal(validate('http://localhost'), true, 'valid with host');
    test.equal(validate('https://localhost'), true, 'valid with host');
});
