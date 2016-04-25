'use strict';

const tape = require('tape');
const RecoveryCode = require('../../../users/recoveryCode');
const types = require('../types');
const required = require('../required');

tape('RecoveryCode model', test => {
    test.plan(7);

    let user = new RecoveryCode({});
    let values = user.schema.paths;

    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['code'], values, test, 'Number');
    types(['userId'], values, test, 'ObjectID');

    user.validate(error => {
        let fields = ['userId', 'code'];
        required(fields, error.errors, test);
    });

    new RecoveryCode({
        userId: 'x'.repeat(24),
        code: 2212
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
