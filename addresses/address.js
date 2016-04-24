/**
 * Address Model for signed round up process transactions
 */
'use strict';

const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    keys: {
        schema: {
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
    }
}, {
    versionKey: false,
});

module.exports = mongoose.model('Address', schema);
