'use strict';

const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    process: {
        type: String,
        required: true,
    },
    last: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Run', schema);
