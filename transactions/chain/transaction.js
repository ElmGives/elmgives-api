/**
 * Transaction Model
 */

'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const crypto = require('crypto');

let signature = new mongoose.Schema({
    header: {
        alg: {
            type: String,
            required: true
        },
        kid: {
            type: String,
            required: true
        }
    },
    signature: {
        type: String,
        required: true
    }
});

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
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        amount: {
            type: String
        },
        roundup: {
            type: String,
            required: true
        },
        balance: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        limit: {
            type: String,
            required: true
        },
        previous: {
            type: String,
            required: true
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
    signatures: [signature]
}, {
    versionKey: false,
});

schema.plugin(timestamps);
schema.pre('save', function compareHash(next) {
    let doc = this;
    let payload = JSON.stringify(doc.payload);
    let hash = crypto.createHash(doc.hash.type).update(payload).digest('hex');
    if (doc.hash.value !== hash) {
        doc.hash.value = hash;
    }
    next();
});

module.exports = mongoose.model('Transaction', schema);
