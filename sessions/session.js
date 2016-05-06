/**
 * Session Model
 * Manage
 *     attributes
 *     store tokens based on user agent
 */
'use strict';

const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    token: {
        type: String,
        required: true
    },

    expire: {
        type: Date,
        required: true
    },

    agent: {
        type: String,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Session', schema);
