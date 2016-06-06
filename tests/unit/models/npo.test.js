'use strict';

const tape = require('tape');
const Npo = require('../../../npos/npo');
const types = require('../types');
const required = require('../required');
const defaults = require('../defaults');

tape('Npo model', test => {
    test.plan(23);

    let npo = new Npo({});
    let values = npo.schema.paths;

    let stringProperties = [
        'name', 'description', 'logoUrl', 'email', 'phone'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');
    types(['userId'], values, test, 'ObjectID');

    defaults(['active'], npo.schema.tree, test, true);
    defaults(['archived'], npo.schema.tree, test, false);

    npo.validate(error => {
        let fields = [
            'userId', 'name', 'description', 'logoUrl', 'email', 'phone',
            'backgroundColor'
        ];

        required(fields, error.errors, test);
    });

    new Npo({
        userId: '4e137bd81a6a8e00000007ac',
        name: 'foobar',
        description: 'barfoo',
        logoUrl: 'http://localhost',
        email: 'foo@bar.com',
        phone: 'some phone',
        backgroundColor: '#000',
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Npo({
        userId: new Array(25).join('x'),
        name: 'foobar',
        description: 'barfoo',
        logoUrl: 'http://localhost',
        email: 'foo',
        phone: 'some phone',
        backgroundColor: '#000'
    }).validate(error => test.equal(true, !!error, 'invalid email'));

    new Npo({
        backgroundColor: '#99'
    }).validate(error => {
        let expected = '#99 is not a valid hex color';
        let actual = error.errors.backgroundColor.message;

        test.equal(expected, actual, 'invalid backgroundColor');
    });
});
