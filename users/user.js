/**
 * User Model
 * Manage
 *     attributes,
 *     CRUD actions and
 *     queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const email = require('../helpers/emailValidator');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String
    },

    email: {
        type: String,
        required: true,
        validate: {
            validator: value => email(value),
            message: '{VALUE} is not a valid email'
        }
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    zip: {
        type: String
    },

    /**
     * Special status for 'deleted' banks
     */
    archived: {
        type: Boolean
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
module.exports = mongoose.model('User', schema);
