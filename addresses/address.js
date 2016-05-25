/**
 * Address Model for signed round up process transactions
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

let schema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    keys: {
        scheme: {
            type: String,
            default: 'ed25519',
        },
        public: {
            type: String,
            required: true,
        },
    },
    latestTransaction: {
        type: String,
        required: true,
    },
    charge: {
        type: String,
    },
}, {
    versionKey: false,
});

schema.plugin(timestamps);

module.exports = mongoose.model('Address', schema);
