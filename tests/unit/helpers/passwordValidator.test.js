'use strict';

let tape = require('tape');
let passwordValidator = require('../../../helpers/passwordValidator');

tape('Password Validator helper', test => {
    test.plan(10);

    [
        '', 'foo', '12345678', 'abcdefgh', 'Foobarfo'
    ].map(password => {
        passwordValidator(password)
            .then(console.log)
            .catch(error => {
                test.equal(!!error, true, `should fail for ${password}`);
            });
    });

    [
        'Foobar123', 'fooBar123', 'FooBar123', 'Foobarfo1', '123456tO',
    ].map(password => {
        passwordValidator(password)
            .then(valid => {
                test.equal(valid, true, `should be valid for ${password}`);
            })
            .catch(console.log);
    });
});
