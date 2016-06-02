/**
 * Test Transaction routes
 */

'use strict';

const tape = require('tape');
const transactions = require('../../../transactions/chain');

let data = {};
let middlewares = {};

let options = {
    'get /transactions': 'get /transactions'
};

transactions.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Transaction Endpoints', test => {
    test.plan(1);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('Transaction endpoints middlewares', test => {
    test.plan(4);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `should validate token on ${key}`);
        test.equal('authenticate', actual[1], `should authenticate on ${key}`);
        test.equal('currentUser', actual[2], `verify current user on ${key}`);
        test.equal('isAdmin', actual[3], `should have admin role on ${key}`);
    });
});
