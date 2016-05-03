/**
 * NPO(Non Profit Organizations) Model
 * Manage attributes, CRUD actions and queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const email = require('../helpers/emailValidator');
const hexColor = require('hex-color-regex');

const REGION = process.env.AWS_S3_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const nodes = ['A', 'B', 'C', 'D', 'E'];

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    name: {
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

    /**
     * Special status for 'deleted' npos
     */
    archived: {
        type: Boolean,
        default: false
    },

    /**
     * Hold status of the npo
     */
    active: {
        type: Boolean,
        default: true
    },

    zip: {
        type: String
    },

    backgroundColor: {
        type: String,
        required: true,
        validate: {
            validator: value => hexColor({
                strict: true
            }).test(value),
            message: '{VALUE} is not a valid hex color'
        }
    },

    node: {
        type: String,
        required: true,
        enum: nodes
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

module.exports = mongoose.model('Npo', schema);
