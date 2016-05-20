/**
 * Transaction Model
 */

'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');

let schema = new mongoose.Schema({
    hash: {
        type: {
            type: String,
            default: 'sha256',
            validate: {
                validator: value => ['sha256', 'sha512'].indexOf(value) > -1,
                message: '{VALUE} hash is not supported'
            }
        },
        value: {
            type: String,
            required: true
        }
    },
    payload: {
        count: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        roundup: {
            type: Number,
            required: true
        },
        balance: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        limit: {
            type: Number,
            required: true
        },
        previous: {
            type: String
        },
        timestamp: {
            type: String,
            required: true
        },
        reference: {
            type: String,
            required: true
        },
        info: {
            type: String
        }
    },
    signatures: []
}, {
    versionKey: false,
});

schema.plugin(timestamps);
schema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', schema);
