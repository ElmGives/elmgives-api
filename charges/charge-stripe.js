'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const unique = require('mongoose-unique-validator');

let schema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true
    },
    customer: {
        type: String,
        required: true
    },
    destination: {
        type: String
    },
    description: {
        type: String
    },
    /* jshint camelcase: false */
    application_fee: {
        type: Number
    },
    stripeId: {
        type: String
    },
    chargeId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    }
}, {
    versionKey: false,
});

schema.plugin(timestamps);
schema.plugin(unique);

module.exports = mongoose.model('StripeCharge', schema);
