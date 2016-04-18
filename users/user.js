/**
 * User Model
 * Manage
 *     attributes,
 *     CRUD actions and
 *     queries
 */
'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const timestamps = require('mongoose-timestamp');
var unique = require('mongoose-unique-validator');

const emailValidator = require('../helpers/emailValidator');
const token = require('../helpers/token');

const pledgeSchema = require('../pledges/schema');

let schema = new mongoose.Schema({
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
    },

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
        index: true,
        unique: true,
        validate: {
            validator: value => emailValidator(value),
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

    plaid: {
        tokens: {
            connect: {
                type: Object,
                default: {}
            }
        }
    },

    stripe: {
        token: {
            type: String
        }
    },

    wallet: {
        addresses: {

        }
    },

    /**
     * Special status for 'deleted' users
     */
    archived: {
        type: Boolean,
        default: false
    },

    /**
     * Hold status of the user
     */
    active: {
        type: Boolean,
        default: true
    },

    address: {
        type: 'Mixed'
    },

    verificationToken: {
        type: String
    },

    pledges: [pledgeSchema]
}, {
    versionKey: false
});

schema.plugin(timestamps);
schema.plugin(unique);
/**
 * Arrow functions doesn't work on this function since the scope of `this` is
 * needed to access `this.PROPERTY`
 */
schema.pre('save', function(next) {
    /**
     * Do not allow update password on edit,
     * We must use a recovery password method
     */
    if (!this.isNew) {
        return next();
    }

    bcrypt.hash(this.password, 8, (error, hash) => {

        if (error) {
            let saltError = new Error();
            saltError.message = 'Cant process request';
            return next(saltError);
        }

        this.password = hash;
        this.verificationToken = token();
        return next();
    });
});

const virtual = schema.virtual('verified');

virtual.get(function() {
    return !this.verificationToken;
});

module.exports = mongoose.model('User', schema);
