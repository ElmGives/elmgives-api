/**
 * Test Charities routes
 */

'use strict';

const tape = require('tape');
const charities = require('../../../charities');

let data = {};
let middlewares = {};

let options = {
    'get /users/:id/charities': 'get /users/:id/charities',
    'post /users/:id/charities': 'post /users/:id/charities',
    'get /users/:id/charities/:charityId': 'get /users/:id/charities/:charityId',
    'put /users/:id/charities/:charityId': 'put /users/:id/charities/:charityId',
    'delete /users/:id/charities/:charityId': 'delete /users/:id/charities/:charityId'
};

charities.stack.map(item => {
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
