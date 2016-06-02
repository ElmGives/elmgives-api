/**
 * Post
 * Manage attributes, CRUD actions and queries
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const REGION = process.env.AWS_S3_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const nodes = ['A', 'B', 'C', 'D', 'E'];

let schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    npoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Npo'
    },

    images: {
        type: Array
    },

    videos: {
        type: Array
    },

    textContent: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 1000
    },

    node: {
        type: String,
        required: true,
        enum: nodes
    },

    /**
     * Special status for 'deleted' posts
     */
    archived: {
        type: Boolean,
        default: false
    },
}, {
    versionKey: false
});

schema.plugin(timestamps);

/**
 * Defined in this way because client side requests full url for images.
 * Do not scale for other clients but that's how it's required right now.
 */
schema.post('init', function(doc) {
    doc.images.map(item => {
        item.source = `https://${REGION}.amazonaws.com/${BUCKET}/${item.source}`;
    });
});

module.exports = mongoose.model('Post', schema);
