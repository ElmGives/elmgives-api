/**
 * Test Sessions routes
 */

'use strict';

const tape = require('tape');
const sessions = require('../../../sessions');

let data = {};
let middlewares = {};

let options = {
    'post /sessions': 'post /sessions',
    'delete /sessions/:id': 'delete /sessions/:id'
};

sessions.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Session Endpoints', test => {
    test.plan(2);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

/**
 * Used to ensure we validate tokens, authenticate user or user current user
 * object properly, at least on functions names
 */
tape.test('Sessions remove token', test => {
    test.plan(1);
    let actual = middlewares['delete /sessions/:id'][0];
    let expected = 'verifyToken';

    test.equal(expected, actual, 'validate token on delete session request');
});
