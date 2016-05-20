'use strict';

let tape = require('tape');
let hashPassword = require('../../../helpers/hashPassword');

tape('Validate emails', (test) => {
    test.plan(2);

    hashPassword('foobar')
        .then(data => {
            test.notEqual(data, 'foobar', 'password hash');
            test.equal(60, data.length, 'password hash length');
        })
        .catch(console.log);
});
