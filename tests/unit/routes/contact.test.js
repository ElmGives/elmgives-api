/**
 * Test contact routes
 */
'use strict';

const tape = require('tape');
const contact = require('../../../contact');

let data = {};
let middlewares = {};

let options = {
    'post /contact': 'post /contact',
};

contact.stack.map(item => {
    let method = Object.keys(item.route.methods).join('');
    let path = item.route.path;
    let key = `${method} ${path}`;
    data[key] = key;

    item.route.stack.map(item => {
        middlewares[key] = middlewares[key] || [];
        middlewares[key].push(item.name);
    });
});

tape.test('Contact Endpoints', test => {
    test.plan(1);

    Object.keys(options).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('contact endpoints middlewares', test => {
    test.plan(1);
    Object.keys(middlewares).map(key => {
        let actual = middlewares[key];
        test.equal('contactUs', actual[0], `validate single middleware`);
    });
});
