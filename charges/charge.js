'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

let schema = new mongoose.Schema({
    addresses: {
        type: [String],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
    },
}, {
    versionKey: false,
});

schema.plugin(timestamps);

module.exports = mongoose.model('Charge', schema);
