/**
 * Post
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

    npoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    images: {
        type: Array
    },

    videos: {
        type: Array
    },

    textContent: {
        type: String
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);
module.exports = mongoose.model('Post', schema);
