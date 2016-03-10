'use strict';

let tape = require('tape');
let expire = require('../../helpers/expire');

tape('Expire helper', test => {
    test.plan(1);

    let now = new Date().getTime();

    test.equal(expire(2).getTime() > now, true, 'valid expire date');
});
