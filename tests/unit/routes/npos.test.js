/**
 * Test NPOs routes
 */

'use strict';

const tape = require('tape');
const npos = require('../../../npos');

let data = {};
let middlewares = {};

let options = {
    'get /npos': 'get /npos',
    'post /npos': 'post /npos',
    'get /npos/:id': 'get /npos/:id',
    'put /npos/:id': 'put /npos/:id',
    'delete /npos/:id': 'delete /npos/:id'
};

npos.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('NPO Endpoints', test => {
    test.plan(5);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

/**
 * Used to ensure we validate tokens, authenticate user or user current user
 * object properly, at least on functions names
 */
tape.test('NPOs endpoints middlewares', test => {
    test.plan(10);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `should validate token on ${key}`);
        test.equal('authenticate', actual[1], `should authenticate on ${key}`);
    });
});
