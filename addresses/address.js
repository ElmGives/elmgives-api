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
        default: '',
    },
    // A signed document where is associate an address with a pledge ID
    statement: {
        signatures: [],
        payload: {
            address: {
                type: String,
            },
            reference: {
                type: String,
            },
            nonce: {
                type: Number,
            },
        },
        hash: {
            type: {
                type: String,
            },
            value: {
                type: String,
            },
        },
    },
}, {
    versionKey: false,
});

module.exports = mongoose.model('Address', schema);
