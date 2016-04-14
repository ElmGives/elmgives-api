/**
 * Test Charities routes
 */

'use strict';

const tape = require('tape');
const pledges = require('../../../pledges');

let data = {};
let middlewares = {};

let options = {
    'get /users/:id/pledges': 'get /users/:id/pledges',
    'post /users/:id/pledges': 'post /users/:id/pledges',
    'get /users/:id/pledges/:pledgeId': 'get /users/:id/pledges/:pledgeId',
    'put /users/:id/pledges/:pledgeId': 'put /users/:id/pledges/:pledgeId',
    'delete /users/:id/pledges/:pledgeId': 'delete /users/:id/pledges/:pledgeId'
};

pledges.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Charities Endpoints', test => {
    test.plan(5);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

/**
 * Used to ensure we validate tokens, authenticate user or user current user
 * object properly, at least on functions names
 */
tape.test('Charitiess endpoints middlewares', test => {
    test.plan(15);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `validate token on ${key}`);
        test.equal('authenticate', actual[1], `authenticate on ${key}`);
        test.equal('currentUser', actual[2], `verify current user on ${key}`);
    });
});
