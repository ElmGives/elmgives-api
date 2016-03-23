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

    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    montlyLimit: {
        type: Number,
        required: true
    },

    disabled: {
        type: Boolean
    },

    archived: {
        type: Boolean
    }
}, {
    versionKey: false
});

module.exports = schema;
