/**
 * Test roles routes
 */
'use strict';

const tape = require('tape');
const roles = require('../../../roles');

let data = {};
let middlewares = {};

let options = {
    'get /roles': 'get /roles',
};

roles.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Role Endpoints', test => {
    test.plan(1);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('roles endpoints middlewares', test => {
    test.plan(4);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `should validate token on ${key}`);
        test.equal('authenticate', actual[1], `should authenticate on ${key}`);
        test.equal('currentUser', actual[2], `use currentUser on ${key}`);
        test.equal('isAdmin', actual[3], `validate amdin user on ${key}`);
    });
});
