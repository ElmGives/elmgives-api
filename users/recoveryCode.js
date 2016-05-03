/**
 * RecoveryCode Model
 * Manage codes associated to user in order to recovery password
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const emailValidator = require('../helpers/emailValidator');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    code: {
        type: Number,
        required: true
    },

    userEmail: {
        type: String,
        required: true,
        validate: {
            validator: value => emailValidator(value),
            message: '{VALUE} is not a valid email'
        }
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);

module.exports = mongoose.model('RecoveryCode', schema);
