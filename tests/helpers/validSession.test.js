'use strict';

let tape = require('tape');
let validateSession = require('../../helpers/validSession');

tape('Validate Session helper', test => {
    test.plan(2);
    let future = new Date(new Date().getTime() + 60);
    let pass = new Date(new Date().getTime() - 1);

    test.equal(validateSession(future), true, 'valid with future datetime');
    test.equal(validateSession(pass), false, 'invalid with pass datetime');
});
