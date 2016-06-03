/**
 * Generic module to find list of models based on model param
 */
'use strict';

const User = require('../../users/user');
const Transaction = require('./transaction');
const queryOptions = require('../../helpers/queryOptions');

const getPledgeAddressByDate = (pledge, date) => pledge.addresses[date];

module.exports = function list(request, response, next) {
    let email = request.query.email;
    let query;

    if (!email) {
        let error = new Error();
        error.status = 400;
        error.message = 'missing-email-parameter';
        return next(error);
    }
    query = {email: email};

    return User.findOne(query)
        .then(user => {
            let error = new Error();
            if (!user) {
                error.status = 404;
                error.message = 'user-email-not-found';
                return Promise.reject(error);
            }

            let addresses = [];
            for (let index in user.pledges) {
                let pledge = user.pledges[index];
                let dates = Object.keys(pledge.addresses || {}).sort().reverse();
                let pledgeAddresses = dates.map(getPledgeAddressByDate.bind(null, pledge));
                addresses.push(pledgeAddresses);
            }
            addresses = addresses.reduce((txs1, txs2) => txs1.concat(txs2));

            query = {
                'payload.address' : {
                    $in: addresses
                }
            };

            /* Search by amount and amount range */
            let amount = Number(request.query.amount);
            if (!isNaN(amount)) {
                query['payload.amount'] = amount;
            }
            let amountRange = request.query.amountRange;
            if (amountRange && amountRange.indexOf('-')) {
                amountRange = amountRange.split('-');
                let gte = Number(amountRange[0]);
                let lte = Number(amountRange[1]);
                if (!isNaN(gte) && !isNaN(lte)) {
                    query['payload.amount'] = {
                        $gte: gte,
                        $lte: lte
                    };
                }
            }

            /* Search by date */
            let date = new Date(request.query.date);
            let days = Number(request.query.days);
            if (date.toString() !== 'Invalid Date' && (!days || !isNaN(days)))  {
                // Ignore timezone by dropping everyting after 'T'
                let startDate = date.toISOString().split('T')[0];
                let endDate = (new Date(date.getTime() + (days + 1 || 1) * 60*60*24*1000))
                    .toISOString().split('T')[0];
                query['payload.timestamp'] = {
                    $gte: startDate,
                    $lt: endDate
                };
            }

            /* Pagination and sorting */
            let options = queryOptions(request, Transaction);
            options.sort = {
                'payload.timestamp': request.query.ascending ? 'ascending' : 'descending'
            };

            return Transaction
                .paginate(query, options)
                .then(results => {
                    let transactions = results.docs;
                    let data = transactions.map(transaction => {
                        return transaction.payload;
                    });

                    return response.json({
                        data: data,
                        meta: {
                            count: transactions.length,
                            email: email,
                            options: options
                        }
                    });
                });
        })
        .catch(next);
};
