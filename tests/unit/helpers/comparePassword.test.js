'use strict';

let tape = require('tape');
let compare = require('../../../helpers/comparePassword');
const hash = '$2a$08$FqxIlWNfKD/sRlsBHtn4SON71eJbtc33G04fgu1hncXtkeBsJYjO2';

tape('Compare password helper', test => {
    test.plan(3);

    compare('foobar', hash)
        .then(value => test.equal(value, true, 'valid with valid value'));

    compare('fobar', hash)
        .then(value => test.equal(value, false, 'invalid different value'));

    compare('', hash)
        .then(value => test.equal(value, false, 'invalid without value'));
});
