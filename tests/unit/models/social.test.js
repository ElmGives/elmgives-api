'use strict';

const tape = require('tape');
const Social = require('../../../socials/social');
const types = require('../types');
const required = require('../required');

tape('social model', test => {
    test.plan(14);

    let social = new Social({});
    let values = social.schema.paths;
    let stringProperties = [
        'providerId', 'email', 'token'
    ];

    types(stringProperties, values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['profile'], values, test, 'Mixed');
    types(['userId'], values, test, 'ObjectID');

    social.validate(error => {
        let fields = ['userId', 'providerId', 'email'];
        required(fields, error.errors, test);
    });

    new Social({}).validate(error => test.equal(true, !!error, 'invalid empty'));

    new Social({
        userId: 'x'.repeat(24),
        token: 'Foobar123',
        email: 'foo@bar.com',
        provider: 'facebook',
        providerId: '1233445',
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Social({
        provider: 'foobar'
    }).validate(error => {
        let expected = '`foobar` is not a valid enum value for path `provider`.';
        let actual = error.errors.provider.message;
        test.equal(expected, actual, 'invalid provider');
    });

    new Social({
        provider: 'facebook'
    }).validate(error => {
        test.equal(undefined, error.errors.provider, 'valid provider');
    });
});
