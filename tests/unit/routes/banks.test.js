/**
 * Test Banks routes
 */

'use strict';

const tape = require('tape');
const banks = require('../../../banks');

let data = {};
let middlewares = {};

let options = {
    'get /banks': 'get /banks',
    'post /banks': 'post /banks',
    'get /banks/:id': 'get /banks/:id',
    'put /banks/:id': 'put /banks/:id',
    'delete /banks/:id': 'delete /banks/:id'
};

banks.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Bank Endpoints', test => {
    test.plan(5);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('Banks endpoints middlewares', test => {
    test.plan(10);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `should validate token on ${key}`);
        test.equal('authenticate', actual[1], `should authenticate on ${key}`);
    });
});
