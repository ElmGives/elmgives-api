'use strict';

const prepareDelete = require('../../../users/prepareDelete');
const tape = require('tape');

tape('Prepare Data to delete user', test => {
    test.plan(3);
    let user = {
        email: 'foo@bar.com'
    };

    test.notEqual(prepareDelete(user).email, 'foo@bar.com', 'change email');
    test.equal(prepareDelete(user).archived, true, 'set archived to true');
    test.equal(prepareDelete(user).active, false, 'set active to false');
});
