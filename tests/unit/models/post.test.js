'use strict';

const tape = require('tape');
const Post = require('../../../posts/post');
const types = require('../types');
const required = require('../required');

tape('Post model', test => {
    test.plan(13);

    let post = new Post({});
    let values = post.schema.paths;

    types(['textContent'], values, test, 'String');
    types(['archived'], values, test, 'Boolean');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['userId', 'npoId'], values, test, 'ObjectID');
    types(['videos', 'images'], values, test, 'Array');

    post.validate(error => {
        required(['userId', 'npoId', 'textContent'], error.errors, test);
    });

    new Post({
        userId: 'x'.repeat(24),
        npoId: 'x'.repeat(24),
        textContent: 'foobar'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));

    new Post({}).validate(error => test.equal(!!error, true, 'invalid empty'));
});
