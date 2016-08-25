'use strict';

const moment = require('moment');
const logger = require('../logger');
const Transaction = require('../transactions/chain/transaction');

module.exports = function findLatestTransactionTimestamp(address) {
    return Transaction
        .find({'payload.address': address})
        .sort({'payload.timestamp': -1, 'payload.count': -1})
        .limit(1)
        .exec()
        .then(transactions => {
            if (!transactions || transactions.length === 0) {
                return Promise.reject(new Error('no-transactions-found'));
            }

            let transaction = transactions[0];
            let timestamp = transaction.payload.timestamp;
            let latestTimestamp = moment(timestamp).format('YYYY-MM-DD');
            
            return latestTimestamp;
        })
        .catch(error => {
            logger.error({err: error});
            return null; // no latest transaction timestamp
        });
};
