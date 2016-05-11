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

    test.deepEqual({}, querySort('', Sort), 'proper response for empty values');
    test.deepEqual({}, querySort('title', Sort), 'proper response for non valid field');
    test.deepEqual({}, querySort('title,foo', Sort), 'proper response for non valid fields');

    test.deepEqual({
        name: -1
    }, querySort('-name', Sort), 'proper response for single value');

    test.deepEqual({
        name: -1,
        price: 1
    }, querySort('-name,price', Sort), 'proper response for multiple values');

    test.deepEqual({
        name: 1,
        price: 1
    }, querySort('name,price', Sort), 'proper response for ascending');

    test.deepEqual({
        name: -1,
        price: -1
    }, querySort('-name,-price', Sort), 'proper response for descending');

    test.deepEqual({
        price: 1
    }, querySort('price,foo', Sort), 'proper response for one valid field');
});
