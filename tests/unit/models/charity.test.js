'use strict';

const tape = require('tape');
const Charity = require('../../../charities/charity');
const types = require('../types');
const required = require('../required');

tape('User\'s Npos model', test => {
    test.plan(11);

    let charity = new Charity({});
    let values = charity.schema.paths;

    types(['montlyLimit'], values, test, 'Number');
    types(['archived', 'disabled'], values, test, 'Boolean');
    types(['userId', 'bankId', 'npoId'], values, test, 'ObjectID');

    charity.validate(error => {
        let fields = ['userId', 'bankId', 'npoId', 'montlyLimit'];
        required(fields, error.errors, test);
    });

    new Charity({
        userId: new Array(25).join('x'),
        npoId: new Array(25).join('x'),
        bankId: new Array(25).join('x'),
        montlyLimit: 50
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
