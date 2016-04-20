/**
 * Test Plaid routes
 */

'use strict';

process.env.PLAID_CLIENTID = 'test_id';
process.env.PLAID_SECRET = 'test_secret';
process.env.PLAID_ENV = 'https://tartan.plaid.com';

const tape = require('tape');
const plaid = require('../../../plaid');

let data = {};
let middlewares = {};

let options = {
    client: {
      /* /plaid/link */
      'post /plaid/link': 'post /plaid/link',
      /* /plaid/connect */
      'get /plaid/connect': 'get /plaid/connect',
      'post /plaid/connect': 'post /plaid/connect',
      'put /plaid/connect': 'put /plaid/connect',
      'delete /plaid/connect': 'delete /plaid/connect',
      'post /plaid/connect/step': 'post /plaid/connect/step'
    },
    public: {
      /* /plaid/institutions */
      'get /plaid/institutions': 'get /plaid/institutions',
    }
};

plaid.stack.map(router => {
    if (router.name !== 'router') { return; }

    let plaidClientKeys = Object.keys(options.client);

    router.handle.stack.map(item => {
        let method = Object.keys(item.route.methods).join('');
        let path = item.route.path;
        let key = `${method} ${path}`;
        data[key] = key;

        if (plaidClientKeys.indexOf(key) >= 0) {
          item.route.stack.map(item => {
              middlewares[key] = middlewares[key] || [];
              middlewares[key].push(item.name);
          });
        }
    });
});

tape.test('Plaid Client Endpoints', test => {
    test.plan(6);

    Object.keys(options.client).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('Plaid endpoints middlewares', test => {
    test.plan(18);
    
    Object.keys(middlewares).map(key => {
        let middleware = middlewares[key];
        test.equal('verifyToken', middleware[0], `should validate token on ${key}`);
        test.equal('authenticate', middleware[1], `should authenticate on ${key}`);
        test.equal('currentUser', middleware[2], `verify current user on ${key}`);
    });
});
