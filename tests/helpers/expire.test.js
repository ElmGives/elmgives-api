'use strict';

let tape = require('tape');
let expire = require('../../helpers/expire');
const HOURS = 60 * 60 * 1000;

tape('Expire helper', test => {
    test.plan(1);

    let future = new Date(new Date().getTime() + HOURS * 2);
    let now = new Date().getTime();

    test.equal(expire(2).getTime() > now, true, 'valid expire date');
});
