/**
 * Charity schema
 */
'use strict';

const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    npoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    npo: {
        type: String,
        required: true
    },

    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    bank: {
        type: String,
        required: true
    },

    // Last 4 digits of the account used for the pledge
    last4: {
        type: String
    },

    monthlyLimit: {
        type: Number,
        default: 5000
    },

    addresses: {
        type: Object,
        default: {}
    },

    active: {
        type: Boolean,
        default: false
    },

    paused: {
        type: Boolean,
        default: false
    },

    archived: {
        type: Boolean
    }
}, {
    versionKey: false
});

module.exports = schema;
