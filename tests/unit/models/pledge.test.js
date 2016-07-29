'use strict';

const tape = require('tape');
const Charity = require('../../../pledges/pledge');
const types = require('../types');
const required = require('../required');

tape('Charity model', test => {
    test.plan(12);

    let pledge = new Charity({});
    let values = pledge.schema.paths;

    types(['monthlyLimit'], values, test, 'Number');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['userId', 'bankId', 'npoId'], values, test, 'ObjectID');

    pledge.validate(error => {
        let fields = [
            'userId', 'bankId', 'npoId', 'npo', 'bank'
        ];
        required(fields, error.errors, test);
    });

    new Charity({
        userId: '4e137bd81a6a8e00000007ac',
        npoId: '4e137bd81a6a8e00000007ac',
        bankId: '4e137bd81a6a8e00000007ac',
        npo: 'foobar',
        bank: 'barfoo',
        monthlyLimit: 50
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
