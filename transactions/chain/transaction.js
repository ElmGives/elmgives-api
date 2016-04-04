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
            type: Number,
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
let schemaPayloadOrder = ['count', 'address', 'amount', 'roundup', 'balance', 'currency', 'limit', 'previous', 'timestamp', 'reference', 'info'];

schema.post('save', function compareHash(doc, next) {
    doc.payload = JSON.parse(JSON.stringify(doc.payload));
    next();
});
schema.post('find', function compareHash(docs) {
    docs.map(doc => {
        doc.payload = JSON.parse(JSON.stringify(doc.payload));
    });
});

module.exports = mongoose.model('Transaction', schema);
