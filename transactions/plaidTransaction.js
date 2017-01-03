/**
 * Transaction Model
 */

'use strict';

const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const timestamps = require('mongoose-timestamp');

let schema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },

    userId: {
        type: String,
        required: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    roundup: {
        type: Number,
        required: true,
    },

    /**
     * Format is 'yyyy-mm-dd'
     */
    date: {
        type: String,
        required: true,
    },

    /**
     * Store where purchase was made
     */
    name: {
        type: String,
    },

    /**
     * Keep transaction status for sum up process
     */
    summed: {
        type: Boolean,
        default: false,
    },
}, {
    versionKey: false,
});

schema.plugin(unique);
schema.plugin(timestamps);

module.exports = mongoose.model('PlaidTransactions', schema);
