/**
 * Generic module to find list of models based on model param
 */
'use strict';

const Transaction = require('./transaction');

module.exports = function list(request, response, next) {
    let query = {};
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
                metadata: {
                    count: transactions.length
                }
            });
        })
        .catch(next);
};
