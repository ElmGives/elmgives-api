'use strict';

const tape = require('tape');
const validate = require('../../../contact/validateRequest');

tape('validation helper', test => {
    test.plan(6);

    test.equal(true, !!validate({
        body: {}
    }), 'validate empty body');

    test.equal('content required', validate({
        body: {}
    }).content, 'validate content');

    test.equal('invalid category value', validate({
        body: {}
    }).category, 'validate category');

    test.equal('invalid email', validate({
        body: {}
    }).email, 'validate email');

    test.equal('invalid email', validate({
        body: {
            contact: 'foo'
        }
    }).email, 'validate contact email');

    test.deepEqual({}, validate({
        body: {
            contact: 'foo@bar.com',
            content: 'foo',
            category: 'comment'
        }
    }), 'valid with proper fields');
});
