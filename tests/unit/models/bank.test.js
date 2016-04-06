'use strict';

const tape = require('tape');
const Bank = require('../../../banks/bank');
const types = require('../types');
const required = require('../required');
const defaults = require('../defaults');

tape('Bank model', test => {
    test.plan(24);

    let bank = new Bank({});
    let values = bank.schema.paths;
    let stringProperties = ['name', 'description', 'logoUrl', 'email', 'phone'];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');
    types(['userId'], values, test, 'ObjectID');

    defaults(['active'], bank.schema.tree, test, true);
    defaults(['archived'], bank.schema.tree, test, false);

    bank.validate(error => {
        let fields = [
            'userId', 'name', 'description', 'logoUrl', 'email', 'phone',
            'hasMultiFactorAuthentication', 'products', 'type'
        ];

        required(fields, error.errors, test);
    });

    new Bank({
        userId: new Array(25).join('x'),
        name: 'foobar',
        description: 'barfoo',
        logoUrl: 'http://localhost',
        email: 'foo@bar.com',
        phone: 'some phone',
        hasMultiFactorAuthentication: true,
        products: [{}],
        type: 'foobar'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Bank({
        logoUrl: 'http://',
    }).validate(error => {
        let expected = 'http:// is not a valid url';
        let actual = error.errors.logoUrl.message;
        test.equal(expected, actual, 'valid message for invalid url');
    });
});
