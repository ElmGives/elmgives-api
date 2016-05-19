'use strict';

const tape = require('tape');
const mongoose = require('mongoose');
const querySort = require('../../../helpers/querySort');

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

let Sort = mongoose.model('Sort', schema);

tape('querySort helper', test => {
    test.plan(8);

    test.deepEqual(querySort('', Sort), {}, 'proper response for empty values');
    test.deepEqual(querySort('title', Sort), {}, 'proper response for non valid field');
    test.deepEqual(querySort('title,foo', Sort), {}, 'proper response for non valid fields');

    test.deepEqual(querySort('-name', Sort), {
        name: -1
    }, 'proper response for single value');

    test.deepEqual(querySort('-name,price', Sort), {
        name: -1,
        price: 1
    }, 'proper response for multiple values');

    test.deepEqual(querySort('name,price', Sort), {
        name: 1,
        price: 1
    }, 'proper response for ascending');

    test.deepEqual(querySort('-name,-price', Sort), {
        name: -1,
        price: -1
    }, 'proper response for descending');

    test.deepEqual(querySort('price,foo', Sort), {
        price: 1
    }, 'proper response for one valid field');
});
