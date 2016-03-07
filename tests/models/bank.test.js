'use strict';

const tape = require('tape');
const Bank = require('../../banks/bank');
const types = require('../types');
const required = require('../required');
const defaults = require('../defaults');

tape('Bank model', test => {
    test.plan(18);

    let bank = new Bank({});
    let values = bank.schema.paths;

    let stringProperties = [
        'name', 'description', 'logoUrl', 'email', 'phone'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');

    defaults(['active'], bank.schema.tree, test, true);
    defaults(['archived'], bank.schema.tree, test, undefined);

    bank.validate(error => {
        let fields = ['name', 'description', 'logoUrl', 'email', 'phone'  ];
        required(fields, error.errors, test);
    });

    new Bank({
        name: 'foobar',
        description: 'barfoo',
        logoUrl: 'logo',
        email: 'someEmail',
        phone: 'some phone'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
