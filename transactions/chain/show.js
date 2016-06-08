/**
 * Generic module to find list of models based on model param
 */
'use strict';

const Transaction = require('./transaction');

module.exports = function list(request, response, next) {
    let hash = request.params.hash;
    let query = {'hash.value': hash};

    return Transaction.findOne(query)
        .then(transaction => {
            if (!transaction) {
                let error = new Error();
                error.status = 404;
                error.message = 'transaction-not-found';
                return Promise.reject(error);
            }
            let payload = Object.assign({hash: transaction.hash.value}, transaction._doc.payload);

            return response.json({
                data: payload,
                meta: {

                }
            });
        })
        .catch(next);
};
