/**
 * 
 */
'use strict';

const moment = require('moment');

const User = require('../users/user');
const Address = require('../addresses/address');
const Transaction = require('../transactions/chain/transaction');

const processRoundups = require('./trigger').one;

module.exports = function rebuildTransactionChain(options) {
    let user = options.user;
    let date = moment(options.date).format('YYYY-MM');
    let query = {
        email: options.email
    };

    let promise = user ? Promise.resolve(user) : User.findOne(query);

    return promise
        .then(user => {
            if (!user) {
                return Promise.reject(new Error('user-not-found'));
            }

            let activePledge = user.pledges.find(pledge => !!pledge.active);
            if (!activePledge) {
                return Promise.reject(new Error('no-active-pledge-found'));
            }

            let address = activePledge.addresses[date];
            if (typeof activePledge.addresses !== 'object' || !activePledge.addresses[date]) {
                return Promise.reject(new Error('no-pledge-address-found'));
            }

            return removeTransactions({address: address})
                .then(genesis => {
                    let query = {address: address};
                    let update = {latestTransaction: genesis.hash.value};
                    user.latestRoundupDate = moment(date).format('YYYY-MM-01');

                    return Promise.all([
                        Address.update(query, update),
                        user.save()
                    ]);
                })
                .then(() => {
                    let dateOptions = {
                        month: true,
                        gte: user.latestRoundupDate,
                        lte: moment(date).add(1, 'month')
                            .subtract(1, 'day').format('YYYY-MM-DD')
                    };

                    return processRoundups(user, dateOptions);
                });
        });
};

function removeTransactions(options) {
    let query = {
        'payload.address': options.address
    };
    let params = {
        sort: {
            'payload.count': 1
        }
    };

    return Transaction.find(query, null, params)
        .then(transactions => {
            if (!transactions.length) {
                return Promise.reject(new Error('no-transactions-found'));
            }

            let genesis = transactions.find(transaction => transaction.payload.count === 0);
            if (!genesis || genesis.hash.value !== transactions[0].hash.value) {
                return Promise.reject(new Error('invalid-transaction-chain'));
            }

            let removeQuery = {
                'payload.address': options.address,
                'payload.count': {$gte: 1}
            };

            return Transaction.remove(removeQuery)
                .then(() => genesis);
        });
}
