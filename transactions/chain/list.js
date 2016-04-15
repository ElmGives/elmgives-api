/**
 * Generic module to find list of models based on model param
 */
'use strict';

const Transaction = require('./transaction');

module.exports = function list(request, response, next) {
    let user = request.currentUser;
    let npo = request.query.npo;
    let address;

    try {
        address = user.wallet.addresses[npo][0];
    } catch(e) {
        let error = new Error();
        error.status = 404;
        error.message = npo ? `No address found for NPO ${npo}`: 'Please provide the NPO name';
        return next(error);
    }
    if (typeof address !== 'string') {
        let error = new Error();
        error.status = 404;
        error.message = `No address found for NPO ${npo}`;
        return next(error);
    }

    let query = {'payload.address': address};

    return Transaction
        .find(query)
        .then(transactions => {
            let data = transactions.map(transaction => {
                return transaction.payload;
            });

            return response.json({
                data: data,
                metadata: {
                    count: transactions.length
                }
            });
        })
        .catch(next);
};
