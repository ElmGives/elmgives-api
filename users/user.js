/**
 * User Model
 * Manage
 *     attributes,
 *     CRUD actions and
 *     queries
 */
'use strict';

const mongoose = require('mongoose');
const hashPassword = require('../helpers/hashPassword');

const timestamps = require('mongoose-timestamp');
var unique = require('mongoose-unique-validator');

const logger = require('../logger');
const emailValidator = require('../helpers/emailValidator');
const passwordValidator = require('../helpers/passwordValidator');
const token = require('../helpers/token');

const pledgeSchema = require('../pledges/schema');

let schema = new mongoose.Schema({
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    name: {
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
        account: {
            type: Object,
            default: {}
        },
        tokens: {
            connect: {
                type: Object,
                default: {}
            }
        }
    },

    stripe: {
        type: Object,
        default: {}
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

    passwordValidator(this.password)
        .then(isValid => {
            return hashPassword(this.password);
        })
        .then(hash => {
            this.password = hash;
            this.verificationToken = token();
            return next();
        })
        .catch(error => {
            logger.error({
                err: error
            });

            if (error.errors) {
                return next(error);
            }

            let saltError = new Error();
            saltError.message = 'Cant process request';

            return next(saltError);
        });
});

const virtual = schema.virtual('verified');

virtual.get(function() {
    return !this.verificationToken;
});

module.exports = mongoose.model('User', schema);
