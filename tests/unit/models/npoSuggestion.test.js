'use strict';

const tape = require('tape');
const NpoSuggestion = require('../../../npos/suggestion');
const types = require('../types');
const required = require('../required');

tape('Npo Suggestion model', test => {
    test.plan(12);

    let npoSuggestion = new NpoSuggestion({});
    let values = npoSuggestion.schema.paths;

    let stringProperties = [
        'name', 'description', 'email', 'phone'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['address'], values, test, 'Mixed');
    types(['userId'], values, test, 'ObjectID');

    npoSuggestion.validate(error => {
        let fields = [
            'userId', 'name'
        ];

        required(fields, error.errors, test);
    });

    new NpoSuggestion({
        userId: new Array(25).join('x'),
        name: 'foobar',
        description: 'barfoo',
        email: 'foo@bar.com',
        phone: 'some phone',
        address: 'some street'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new NpoSuggestion({
        userId: new Array(25).join('x'),
        name: 'foobar',
        description: 'barfoo',
        email: 'foo',
        phone: 'some phone',
    }).validate(error => test.equal(true, !!error, 'invalid email'));
});
