/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const Npo = require('../npos/npo');
const Charge = require('../charges/charge');
const Transaction = require('../transactions/chain/transaction');
const arraySort = require('../helpers/arraySort');
const P = require('bluebird');
const PROMISE_CONCURRENCY = 10;

module.exports = function getPledgeTransactionHistory(request, response, next) {
    let all = request.query.all;
    let user = request.currentUser;
    let userID = request.params.id;
    let pledgeID = request.params.pledgeId;
    let pledge = user.pledges.find(pledge => String(pledge._id) === pledgeID);
    let error = new Error();
    let npo;

    if (String(request.session.userId) !== userID) {
        error.status = 401;
        error.message = 'unauthorized-user';
        return next(error);
    }
    if (!pledge) {
        error.status = 404;
        error.message = 'pledge-not-found';
        return next(error);
    }

    /* Retrieve the transactions of (each/all of) the pledge addresses */
    let dates = Object.keys(pledge.addresses || {}).sort();
    dates = request.query.newestFirst ? dates.reverse() : dates;
    let addresses = dates.map(date => pledge.addresses[date]).slice(0, all ? undefined : 1);
    let lastAddressIndex = addresses.length - 1;

    let promises = P.map(addresses, address => {
        return Charge.findOne({addresses: {$in: [address]}})
            .then(charge => {
                let balanceThreshold = -Infinity;

                /* Use the amount charged on previous months to filter transactions */
                if (charge && typeof charge.amount === 'number' &&
                    charge.addresses.indexOf(address) === 0) {
                    balanceThreshold = -Math.abs(charge.amount);
                /* Or use the current pledge monthly limit if the address is used for the current month */
                } else if (request.query.newestFirst && addresses.indexOf(address) === 0 ||
                    !request.query.newestFirst && addresses.indexOf(address) === lastAddressIndex) {
                    balanceThreshold = -pledge.monthlyLimit;
                }

                return Transaction.find({
                    'payload.address': address,
                    'payload.balance': {$gte: balanceThreshold}
                });
            })
            .then(transactions => {
                return transactions.map(transaction => transaction.payload)
                    .sort(arraySort('count', request.query.newestFirst));
            });
    }, {concurrency: PROMISE_CONCURRENCY});

    Npo.findOne({_id: pledge.npoId})
        .then(_npo => {
            npo = _npo;
            return promises;
        })
        .then(transactions => {
            /* Group all transactions in one array regardless of their address */
            if (transactions.length) {
                transactions = transactions.reduce((txs1, txs2) => txs1.concat(txs2));
            }

            let page = request.query.page || {};
            let offset = isNaN(page.offset) ? 0 : Number(page.offset);
            let limit = isNaN(page.limit) ? transactions.length : Number(page.limit);
            transactions = transactions.slice(offset, offset + limit);

            response.json({
                data: {
                    id: npo._id,
                    logo: npo.logoUrl,
                    transactions
                },
                meta: {
                    count: transactions.length
                }
            });
        });
};
