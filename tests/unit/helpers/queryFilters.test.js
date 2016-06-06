'use strict';

const tape = require('tape');
const mongoose = require('mongoose');
const queryFilters = require('../../../helpers/queryFilters');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    versionKey: false
});

let QueryFilters = mongoose.model('QueryFilters', schema);

tape('queryFilters helper', test => {
    test.plan(4);

    test.deepEqual(queryFilters({query: {}}, QueryFilters), {}, 'proper filters with empty values');

    test.deepEqual(queryFilters({
        query: {
            filter: {
                name: 'abc'
            }
        }
    }, QueryFilters).name, /^abc/, 'proper name filter');

    test.deepEqual(queryFilters({
        query: {
            filter: {
                email: 'abc'
            }
        }
    }, QueryFilters).email, /^abc/, 'proper email filter');

    test.deepEqual(queryFilters({
        query: {
            filter: {
                amount: 9
            }
        }
    }, QueryFilters).amount, 9, 'proper amount filter');
});
