/**
 * Test Plaid routes
 */

'use strict';

const tape = require('tape');
const oauth = require('../../../oauth');

let data = {};
let middlewares = {};

let options = {
    stripe: {
      /* /oauth/callback/stripe */
      'get /oauth/callback/stripe': 'get /oauth/callback/stripe',
    }
};

oauth.stack.map(router => {
    if (router.name !== 'router') { return; }

    let stripeOAuthKeys = Object.keys(options.stripe);

    router.handle.stack.map(item => {
        let method = Object.keys(item.route.methods).join('');
        let path = item.route.path;
        let key = `${method} ${path}`;
        data[key] = key;

        if (stripeOAuthKeys.indexOf(key) >= 0) {
          item.route.stack.map(item => {
              middlewares[key] = middlewares[key] || [];
              middlewares[key].push(item.name);
          });
        }
    });
});

tape.test('Stripe OAuth Endpoints', test => {
    test.plan(1);

    Object.keys(options.stripe).map(key => {
        test.equal(key, data[key], `should provide ${key} endpoint`);
    });
});

tape.test('Stripe OAuth middlewares', test => {
    test.plan(1);

    Object.keys(middlewares).map(key => {
        let middleware = middlewares[key];
        test.equal(middleware.length, 1, `should have no extra middlewares`);
    });
});
