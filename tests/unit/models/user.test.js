'use strict';

const tape = require('tape');
const User = require('../../../users/user');
const types = require('../types');
const required = require('../required');
const unique = require('../unique');
const index = require('../index');
const defaults = require('../defaults');
const mongoose = require('mongoose');
const mockgoose = require('mockgoose');
const logger = require('../../../logger');

mockgoose(mongoose);

tape('User model', test => {
    test.plan(22);

    let user = new User({});
    let values = user.schema.paths;
    let stringProperties = [
        'name', 'password', 'phone', 'email', 'zip', 'verificationToken'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['archived', 'active'], values, test, 'Boolean');
    types(['address'], values, test, 'Mixed');
    types(['pledges'], values, test, 'Array');

    defaults(['active'], user.schema.tree, test, true);
    defaults(['archived'], user.schema.tree, test, false);
    unique(['email'], user.schema.tree, test);
    index(['email'], user.schema.tree, test);

    user.validate(error => required(['email', 'password'], error.errors, test));

    new User({
        email: 'foo@bar.com',
        password: 'Foobar123',
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new User({
        email: 'foo',
    }).validate(error => {
        let expected = 'foo is not a valid email';
        let actual = error.errors.email.message;
        test.equal(expected, actual, 'valid message for invalid email');
    });

    /**
     * We are using fake database to test password hash
     */
    mongoose.connect('mongodb://example.com/TestingDB', function(error) {
        if (error) {
            return logger.error({
                err: error
            });
        }

        new User({
                email: 'foo@bar.com',
                password: 'Foobar123',
                verificationToken: 1111
            })
            .save()
            .then(data => {
                test.notEqual(data.password, 'foobar', 'password hash');
                test.equal(60, data.password.length, 'password hash length');

                /**
                 * Reset and close connection
                 */
                mockgoose.reset(function() {});
                mongoose.connection.close(function() {});
            })
            .catch(error => {
                logger.error({
                    err: error
                });
                mockgoose.reset(function() {});
                mongoose.connection.close(function() {});
            });
    });
});
