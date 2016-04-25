/**
 * RecoveryCode Model
 * Manage codes associated to user in order to recovery password
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    code: {
        type: Number,
        required: true
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);

module.exports = mongoose.model('RecoveryCode', schema);
