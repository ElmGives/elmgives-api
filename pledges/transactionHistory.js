/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const Transaction = require('../transactions/chain/transaction');

module.exports = function getPledgeTransactionHistory(request, response, next) {
    let all = request.query.all;
    let user = request.currentUser;
    let userID = request.params.id;
    let pledgeID = request.params.pledgeId;
    let pledge = user.pledges.find(pledge => String(pledge._id) === pledgeID);
    let error = new Error();

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
    let addresses = (pledge.addresses || []).slice(0, all ? undefined : 1);
    let promises = addresses.map(address => {
        return Transaction.find({'payload.address': address})
            .then(transactions => {
                return transactions.map(transaction => transaction.payload);
            });
    });

    Promise.all(promises)
        .then(transactions => {
            /* Group all transactions in one array regardless of their address */
            if (transactions.length) {
                transactions = transactions.reduce((txs1, txs2) => txs1.concat(txs2));
                transactions.sort((tx1, tx2) => { // tx: transaction
                    return tx1.timestamp < tx2.timestamp ? -1 : 1;
                });
            }
            response.json({
                data: transactions,
                metadata: {
                    count: transactions.length
                }
            });
        });
};
