/**
 * NPO(Non Profit Organizations) Model
 * Manage attributes, CRUD actions and queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const validateUrl = require('../helpers/validateUrl');

let schema = new mongoose.Schema({
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
        required: true,
        validate: {
            validator: value => validateUrl(value),
            message: '{VALUE} is not a valid url'
        }
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    /**
     * Special status for 'deleted' npos
     */
    archived: {
        type: Boolean
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

    address: {
        type: 'Mixed'
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);
module.exports = mongoose.model('Npo', schema);
