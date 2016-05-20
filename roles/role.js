/**
 * Role
 * Manage attributes, CRUD actions and queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);
module.exports = mongoose.model('Role', schema);
