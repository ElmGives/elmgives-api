'use strict';

const tape = require('tape');
const Role = require('../../../roles/role');
const types = require('../types');
const required = require('../required');

tape('Role model', test => {
    test.plan(9);

    let role = new Role({});
    let values = role.schema.paths;

    types(['title', 'description'], values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['userId'], values, test, 'ObjectID');

    role.validate(error => required(['userId', 'title'], error.errors, test));

    new Role({
        userId: '4e137bd81a6a8e00000007ac',
        title: 'foobar'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Role({}).validate(error => test.equal(true, !!error, 'invalid with empty'));
});
