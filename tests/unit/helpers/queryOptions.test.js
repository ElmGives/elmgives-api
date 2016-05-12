'use strict';

const tape = require('tape');
const mongoose = require('mongoose');
const queryOptions = require('../../../helpers/queryOptions');

let schema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    }
}, {
    versionKey: false
});

let QueryOptions = mongoose.model('QueryOptions', schema);

tape('queryOptions helper', test => {
    test.plan(7);

    const request = {
        query: {}
    };

    const expected = {
        lean: true,
        limit: 10,
        page: 1,
        select: '',
        sort: {}
    };

    test.deepEqual(queryOptions(request, QueryOptions), expected, 'proper options with empty values');

    test.deepEqual(queryOptions({
        query: {
            page: 2
        }
    }, QueryOptions).page, 2, 'proper page value');

    test.deepEqual(queryOptions({
        query: {
            sort: '-name'
        }
    }, QueryOptions).sort.name, -1, 'proper sort value');

    test.deepEqual(queryOptions({
        query: {
            sort: '-name,price'
        }
    }, QueryOptions).sort.price, 1, 'proper sort ascending value');

    test.deepEqual(queryOptions({
        query: {
            perPage: 2
        }
    }, QueryOptions).limit, 2, 'proper limit value');

    test.deepEqual(queryOptions({
        query: {
            fields: 'name'
        }
    }, QueryOptions).select, 'name', 'proper select valid value');

    test.deepEqual(queryOptions({
        query: {
            fields: 'foobar'
        }
    }, QueryOptions).select, '', 'proper select invalid value');
});
