/**
 * Social
 * Manage attributes
 * Used to manage social login and store tokens
 */
'use strict';

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const providers = ['facebook'];

let schema = new mongoose.Schema({
    /**
     * Every Social should be associated to an ELM user
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    /**
     * String represntation for our defined providers, for now: facebook\
     */
    provider: {
        type: String,
        required: true,
        enum: providers
    },

    /**
     * Id provided from provider, for now, facebookId
     */
    providerId: {
        type: String,
        required: true
    },

    /**
     * Email associated to user on Social provider and also, user associated to our
     * user
     */
    email: {
        type: String,
        required: true
    },

    /**
     * Authentication token from social provider
     */
    token: {
        type: String,
        required: true
    },

    /**
     * Store all information from Social provider, raw object for now
     */
    profile: {
        type: Object
    }
}, {
    versionKey: false
});

schema.plugin(timestamps);
module.exports = mongoose.model('Social', schema);
