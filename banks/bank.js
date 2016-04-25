/**
 * Bank Model
 * Manage
 *     attributes,
 *     CRUD actions and
 *     queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const email = require('../helpers/emailValidator');
const REGION = process.env.AWS_S3_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    logoUrl: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        validate: {
            validator: value => email(value),
            message: '{VALUE} is not a valid email'
        }
    },

    phone: {
        type: String,
        required: true
    },

    hasMultiFactorAuthentication: {
        type: Boolean,
        required: true
    },

    multiFactorAuthentication: {
        type: Array
    },

    products: {
        type: Array,
        required: true
    },

    /**
     * Special status for 'deleted' banks
     */
    archived: {
        type: Boolean,
        default: false
    },

    /**
     * Hold status of the bank
     */
    active: {
        type: Boolean,
        default: true
    },

    address: {
        type: 'Mixed'
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);

schema.post('init', function(doc) {
    doc.logoUrl = `https://${REGION}.amazonaws.com/${BUCKET}/${doc.logoUrl}`;
});

module.exports = mongoose.model('Bank', schema);
