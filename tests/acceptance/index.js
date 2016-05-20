/**
 * Test endpoints and validate responses
 */
'use strict';

const tape = require('tape');
const request = require('request');

const API = 'http://localhost:3000/';
const SESSIONS = 'http://localhost:3000/sessions';

tape.test('Unauthenticated GET request', test => {
    test.plan(4);

    ['banks', 'npos'].map(resource => {
        request(API + resource, (error, response, body) => {
            body = JSON.parse(body);
            test.equal(response.statusCode, 422, `${resource} proper code`);
            test.equal(body.error, 'token required', `${resource} token`);
        });
    });
});

const headers = {
    'User-Agent': 'request'
};

tape.test(`POST to resources`, test => {
    test.plan(4);

    [{
        url: API + 'banks',
        form: {},
        headers: headers
    }, {
        url: API + 'npos',
        form: {},
        headers: headers
    }].map(item => {
        request.post(item, (error, response, body) => {
            body = JSON.parse(body);
            test.equal(response.statusCode, 422, `${item.url} status code`);
            test.equal(body.error, 'token required', `${item.url} token`);
        });
    });
});

tape.test('User POST /sessions', test => {
    test.plan(2);

    request.post({
        url: SESSIONS,
        headers: {
            'User-Agent': 'request'
        },
        form: {
            'email': 'homer'
        }
    }, (error, response, body) => {
        body = JSON.parse(body);
        test.equal(response.statusCode, 422, 'proper status code response');
        test.equal(body.error, 'Email and password required', `required fields`);
    });
});
