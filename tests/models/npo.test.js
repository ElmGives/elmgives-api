'use strict';

const tape = require('tape');
const Npo = require('../../npos/npo');
const types = require('../types');
const required = require('../required');
const defaults = require('../defaults');

tape('Npo model', test => {
    test.plan(19);

    let npo = new Npo({});
    let values = npo.schema.paths;

    let stringProperties = [
        'name', 'description', 'logoUrl', 'email', 'phone'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');

    defaults(['active'], npo.schema.tree, test, true);
    defaults(['archived'], npo.schema.tree, test, undefined);

    npo.validate(error => {
        let fields = ['name', 'description', 'logoUrl', 'email', 'phone'];
        required(fields, error.errors, test);
    });

    new Npo({
        name: 'foobar',
        description: 'barfoo',
        logoUrl: 'http://localhost',
        email: 'someEmail',
        phone: 'some phone',
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Npo({
        logoUrl: 'http://',
    }).validate(error => {
        let expected = 'http:// is not a valid url';
        let actual = error.errors.logoUrl.message;
        test.equal(expected, actual, 'valid message for invalid url')
    });
});
