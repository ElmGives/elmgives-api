/**
 * 
 */
'use strict';

const User = require('../users/user');
const Bank = require('../banks/bank');
const requestAndRoundup = require('./roundAndSendToAwsQueue');
const objectId = require('mongoose').Types.ObjectId;
const logger = require('../logger');
const moment = require('moment');
const P = require('bluebird');

const ROUNDUP_CONCURRENCY = 10;

module.exports = function triggerRoundups(options) {
    options = typeof options === 'object' ? options : {};
    let queryPromise;

    let query = {
        active: true,
        pledges: {$exists: true},
        'pledges.active': true,
        'pledges.addresses': {$exists: true},

        plaid: {$exists: true},
        'plaid.accounts': {$exists: true, $ne: {}},
        'plaid.tokens.connect': {$exists: true, $ne: {}}
    };
    let selector = {
        _id: 1,
        plaid: 1,
        pledges: 1,
        latestRoundup: 1
    };

    if (typeof options.id === 'string') {
        query._id = objectId(options.id);
        queryPromise = User.findOne(query, selector);
    } else if (options.ids instanceof Array) {
        query._id = {$in: options.ids.map(id => objectId(id))};
        queryPromise = User.find(query, selector);
    } else {
        queryPromise = User.find(query, selector);
    }

    return queryPromise
        .then(users => {
            return P.map(users, user => processRoundups(user, options), {
                concurrency: ROUNDUP_CONCURRENCY
            });
        });
};

function processRoundups(user, options) {
    return buildRoundupParams(user, options)
        .then(roundupParams => {
            let dateOptions = {};
            logger.info(`Triggering roundup process for user ${user._id}:${user.email}`);
            return requestAndRoundup(roundupParams, dateOptions);
        })
        .catch(error => {
            error.details = {userId: user._id, userEmail: user.email};
            logger.error({err: error});
        });
}

function buildRoundupParams(user, options) {
    let currentMonth = options.date || moment().format('YYYY-MM');
    let activePledge = user.pledges.find(pledge => pledge.active);
    let bankId = activePledge.bankId;

    let params = {
        limit: activePledge.monthlyLimit,
        address: activePledge.addresses[currentMonth]
    };

    return Bank.findOne({_id: objectId(bankId)})
        .then(bank => {
            if (!bank) {
                return Promise.reject(new Error('invalid-pledge-bank'));
            }

            try {
                params.token = user.plaid.tokens.connect[bank.type];
                params.plaidAccountId = user.plaid.accounts[bank.type].id;
            } catch (error) {
                return Promise.reject(error);
            }

            return params;
        });
}
