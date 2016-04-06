'use strict';

const tape = require('tape');
const Session = require('../../../sessions/session');
const types = require('../types');
const required = require('../required');

tape('Session Model', test => {
    test.plan(10);

    let session = new Session({});
    let values = session.schema.paths;

    types(['token', 'agent'], values, test, 'String');
    types(['expire'], values, test, 'Date');
    types(['userId'], values, test, 'ObjectID');
    types(['verified'], values, test, 'Boolean');

    session.validate(error => {
        let fields = ['userId', 'token', 'agent', 'expire', 'verified'];
        required(fields, error.errors, test);
    });

    new Session({
        token: 'foobar',
        userId: '56e1b1c2235d3773226cf344',
        expire: new Date(),
        agent: 'foobar'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
