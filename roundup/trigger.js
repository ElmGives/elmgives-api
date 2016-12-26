/**
 * 
 */
'use strict';

const User = require('../users/user');
const Bank = require('../banks/bank');
const getFromAws = require('./getFromAws').get;
const getLatestTransactionTimestamp = require('./timestamp');
const requestAndRoundup = require('./roundAndSendToAwsQueue').request;

const objectId = require('mongoose').Types.ObjectId;
const logger = require('../logger');
const moment = require('moment');
const P = require('bluebird');

const ROUNDUP_CONCURRENCY = 10;
const ONE_MINUTE = 60 * 1000;
const YMD = 'YYYY-MM-DD';

function triggerRoundups(options) {
    options = typeof options === 'object' ? options : {};
    let queryPromise;

    let query = {
        active: true,
        pledges: {
            $elemMatch: {
                active: true,
                paused: false,
                addresses: {$exists: true}
            }
        },

        plaid: {$exists: true},
        'plaid.accounts': {$exists: true, $ne: {}},
        'plaid.tokens.connect': {$exists: true, $ne: {}}
    };
    let selector = {
        _id: 1,
        plaid: 1,
        pledges: 1,
        latestRoundupDate: 1
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
            users = users instanceof Array ? users : [users];
            return P.map(users, user => processRoundups(user, options), {
                concurrency: ROUNDUP_CONCURRENCY
            });
        })
        .then(users => {
            if (!users || users.length === 0) { return; }
            /* Since there is currently no feedback from the signer server regarding the
               availability of the requested transaction chain signatures, this code waits
               for one minute before polling the AWS queue for the response signatures */
            return P.delay(ONE_MINUTE).then(() => getFromAws({firstRun:true}));
        });
}

function processRoundups(user, options) {
    let dateOptions = setupDateOptions(user.latestRoundupDate, options);
    if (typeof dateOptions === 'string') {
        logger.info(`Skipping roundup process for user ${user._id}:${user.email} (${dateOptions})`);
        return Promise.resolve();
    }

    return buildRoundupParams(user, options)
        .then(roundupParams => {
            return getLatestTransactionTimestamp(roundupParams.address)
                .then(latestTimestamp => {
                    if (latestTimestamp) {
                        /* Modify start date to request and catch up with previous days */
                        let latestNextDay = moment(latestTimestamp).add(1, 'days').format(YMD);
                        dateOptions.gte = dateOptions.gte < latestNextDay ?
                            dateOptions.gte : latestNextDay;
                    }
                })
                .then(() => roundupParams);
        })
        .then(roundupParams => {
            logger.info(`Triggering roundup process for user ${user._id}:${user.email}`);
            return requestAndRoundup(roundupParams, dateOptions)
                .then(() => {
                    user.latestRoundupDate = moment().format(YMD);
                    return user.save();
                });
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

function setupDateOptions(latestRoundupDate, options) {
    let today = moment().format(YMD);
    if (latestRoundupDate === today) {
        return 'already-run-today';
    }

    let dateOptions = {
        lte: options.lte,
        gte: options.gte
    };

    let lteDate = moment(dateOptions.lte);
    if (lteDate.isValid() && lteDate.format(YMD) < today) {
        dateOptions.lte = lteDate.format(YMD);
    }

    let gteDate = moment(dateOptions.gte || latestRoundupDate);
    if (gteDate.isValid() && gteDate.format(YMD) < today) {
        dateOptions.gte = gteDate.format(YMD);
    } else if (options.month) {
        dateOptions.gte = moment().format('YYYY-MM-01'); // first day of the month
    }

    return dateOptions;
}

module.exports = {
    all: triggerRoundups,
    one: processRoundups
};
