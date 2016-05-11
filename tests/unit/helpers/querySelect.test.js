'use strict';

const tape = require('tape');
const mongoose = require('mongoose');
const querySelect = require('../../../helpers/querySelect');

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

let Model = mongoose.model('Model', schema);

tape('querySelect helper', test => {
    test.plan(4);

    test.equal(querySelect('', Model), '', 'proper select options with empty object');
    test.equal(querySelect('name', Model), 'name', 'proper select with one field');
    test.equal(querySelect('name,foo', Model), 'name', 'proper select with invalid field');
    test.equal(querySelect('name,type,price', Model), 'name type price', 'with all fields');
});
