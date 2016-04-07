'use strict';

const tape = require('tape');
const Post = require('../../../posts/post');
const types = require('../types');
const required = require('../required');

tape('Post model', test => {
    test.plan(14);

    let post = new Post({});
    let values = post.schema.paths;

    types(['textContent'], values, test, 'String');
    types(['archived'], values, test, 'Boolean');
    types(['createdAt', 'updatedAt'], values, test, 'Date');
    types(['userId', 'npoId'], values, test, 'ObjectID');
    types(['videos', 'images'], values, test, 'Array');

    post.validate(error => {
        required(['userId', 'npoId'], error.errors, test);
    });

    new Post({
        userId: 'x'.repeat(24),
        npoId: 'x'.repeat(24),
        textContent: 'x'.repeat(10)
    }).validate(error => {
        test.equal(undefined, error, 'valid with attributes');
    });

    new Post({}).validate(error => {
        test.equal(!!error, true, 'invalid empty');
    });

    new Post({
        textContent: 'x'
    }).validate(error => {
        let actual = error.errors.textContent.kind;
        let expected = 'minlength';
        test.equal(expected, actual, 'require min length for text content');
    });

    new Post({
        textContent: 'x'.repeat(1001)
    }).validate(error => {
        let actual = error.errors.textContent.kind;
        let expected = 'maxlength';
        test.equal(expected, actual, 'require max length for text content');
    });
});
