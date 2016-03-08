'use strict';

const tape = require('tape');
const User = require('../../users/user');
const types = require('../types');
const required = require('../required');
const defaults = require('../defaults');

tape('User model', test => {
    test.plan(19);

    let user = new User({});
    let values = user.schema.paths;
    let stringProperties = [
        'name', 'firstName', 'lastName', 'password', 'phone', 'email', 'zip'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');

    defaults(['active'], user.schema.tree, test, true);
    defaults(['archived'], user.schema.tree, test, undefined);

    user.validate(error => {
        let fields = ['name', 'firstName', 'email'];
        required(fields, error.errors, test);
    });

    new User({
        name: 'foobar',
        firstName: 'barfoo',
        email: 'foo@bar.com',
        password: 'foobar'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new User({
        email: 'foo',
    }).validate(error => {
        let expected = 'foo is not a valid email';
        let actual = error.errors.email.message;
        test.equal(expected, actual, 'valid message for invalid email');
    });
});
