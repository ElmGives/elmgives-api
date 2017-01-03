/**
 * NPO(Non Profit Organizations) Model
 * Manage attributes, CRUD actions and queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const email = require('../helpers/emailValidator');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    url: {
        type: String
    },

    email: {
        type: String,
        validate: {
            validator: value => email(value),
            message: '{VALUE} is not a valid email'
        }
    },

    phone: {
        type: String
    },

    address: {
        type: 'Mixed'
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);

module.exports = mongoose.model('NpoSuggestion', schema);
