'use strict';

const tape = require('tape');
const validate = require('../../../contact/validateRequest');

tape('validation helper', test => {
    test.plan(5);

    test.equal(true, !!validate({
        body: {}
    }), 'validate empty body');

    test.equal('content required', validate({
        body: {}
    }).content, 'validate content');

    test.equal('invalid category value', validate({
        body: {}
    }).category, 'validate category');

    test.equal('email required', validate({
        body: {}
    }).email, 'validate category');

    test.deepEqual({}, validate({
        body: {
            contact: 'foo@bar.com',
            content: 'foo',
            category: 'comment'
        }
    }), 'valid with proper fields');
});
