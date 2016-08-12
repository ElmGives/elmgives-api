/**
 * 
 */
'use strict';

const Charge = require('./charge');
const User = require('../users/user');
const Bank = require('../banks/bank');
const calculateCharge = require('./calculate');

const objectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const logger = require('../logger');
const P = require('bluebird');
const PROMISE_CONCURRENCY = 10;

module.exports = function prepareCharges(options) {
    options = typeof options === 'object' ? options : {};
    let query = {
        active: true,
        stripe: {$exists: true},
        pledges: {$exists: true}
    };

    if (typeof options.id === 'string') {
        query._id = objectId(options.id);
    } else if (options.ids instanceof Array) {
        query._id = {$in: options.ids.map(id => objectId(id))};
    }

    return User.find(query)
        .then(users => {
            return P.map(users, user => prepareCharge(user, options), {
                concurrency: PROMISE_CONCURRENCY
            });
        });
};

function prepareCharge(user, options) {

    return buildChargeParams(user, options)
        .then(chargeParams => {
            return Charge.create(chargeParams);
        })
        .catch(error => {
            if (error instanceof Error) {
                logger.error({err: error});
            }
        });
}

function buildChargeParams(user, options) {
    let date = options.date || moment().subtract(1, 'month').format('YYYY-MM');
    let activePledge = user.pledges.find(pledge => pledge.active);
    if (!activePledge) {
        return Promise.reject(new Error('no-active-pledge'));
    } else if (!activePledge.addresses[date]) {
        logger.info(`No address for user ${user._id} on ${date}`);
        return Promise.reject('no-address-for-date');
    }

    let chargeParams = {
        addresses: [activePledge.addresses[date]],
        amount: 0,
        currency: 'usd',
        userId: user._id,
        npoId: activePledge.npoId,
        details: {
            name: user.name,
            email: user.email
        }
    };

    return Bank.findOne()
        .then(bank => {
            if (!bank) {
                return Promise.reject('pledge-bank-not-found');
            } else if (!bank.type || !user.stripe || !user.stripe[bank.type]) {
                return Promise.reject('user-missing-stripe-info');
            }

            chargeParams.bankType = bank.type;
            chargeParams.details.ach = user.stripe[bank.type].ach;

            return calculateCharge(user, activePledge, chargeParams.addresses, {
                ach: chargeParams.details.ach
            });
        })
        .then(charge => {
            chargeParams.amount = charge.amount;
            chargeParams.currency = charge.currency;
            chargeParams.details.fee = charge.fee;
            chargeParams.details.net = charge.net;

            return chargeParams;
        });
}
