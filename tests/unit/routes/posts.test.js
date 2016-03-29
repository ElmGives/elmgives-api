/**
 * Test Posts routes
 */

'use strict';

const tape = require('tape');
const posts = require('../../../posts');

let data = {};
let middlewares = {};

let options = {
    'get /posts': 'get /posts',
    'post /posts': 'post /posts',
    'get /posts/:id': 'get /posts/:id',
    // 'put /posts/:id': 'put /posts/:id',
    // 'delete /posts/:id': 'delete /posts/:id'
};

posts.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Post Endpoints', test => {
    test.plan(3);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('Posts endpoints middlewares', test => {
    test.plan(12);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('verifyToken', actual[0], `should validate token on ${key}`);
        test.equal('authenticate', actual[1], `should authenticate on ${key}`);
        test.equal('currentUser', actual[2], `use currentUser on ${key}`);
        test.equal('isAdmin', actual[3], `validate amdin user on ${key}`);
    });
});
