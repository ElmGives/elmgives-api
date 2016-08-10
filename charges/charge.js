'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const emailValidator = require('../helpers/emailValidator');

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
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    npoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bankType: {
        type: String,
        required: true
    },
    report: {
        name: {
            type: String,
        },
        email: {
            type: String,
            validate: {
                validator: value => emailValidator(value),
                message: '{VALUE} is not a valid email'
            }
        },
        fee: {
            type: Number,
        },
        net: {
            type: Number,
        },
        ach: {
            type: Boolean
        },
    },
    status: {
        type: String,
        default: 'pending'
    }
}, {
    versionKey: false,
});

schema.plugin(timestamps);

module.exports = mongoose.model('Charge', schema);
