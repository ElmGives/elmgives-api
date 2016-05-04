/**
 * Generic module to find list of models based on model param
 */
'use strict';

const User = require('../../users/user');
const Transaction = require('./transaction');

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
            if (!user.pledges || !user.pledges.length || !user.pledges[0].addresses.length) {
                error.status = 404;
                error.message = 'no-pledge-addresses-found';
                return Promise.reject(error);
            }

            let addresses = user.pledges[0].addresses;
            query = {
                'payload.address' : {
                    $in: addresses
                }
            };
            /* Filter by amount value and amount range */
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

            let options = {
                offset: request.query.offset || 0,
                limit: request.query.limit || 10
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
                            email: email
                        }
                    });
                });
        })
        .catch(next);
};
