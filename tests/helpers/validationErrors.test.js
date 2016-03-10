'use strict';

let tape = require('tape');
let validationErrors = require('../../helpers/validationErrors');

tape('Validation Errors helper', test => {
    test.plan(1);

    let data = {
        errors: {
            title: {
                message: 'foobar'
            }
        }
    };

    let expected = {
        title: 'foobar'
    };

    let actual = validationErrors(data);

    test.equal(expected.title, actual.title, 'proper errors');
});
