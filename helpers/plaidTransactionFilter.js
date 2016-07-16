/**
 * Checks if a transaction is worth of analizing for roundup process
 * @param  {String}  User plaid bank account ID
 * @param  {object}  A plaid transaction object received o a request to their service
 * @return {boolean}
 */

'use strict';

module.exports = function plaidTransactionFilter(accountId, transaction) {

    return !!((transaction && transaction.type && transaction.type.primary && 'pending' in transaction) &&
        // (transaction.type.primary !== '...') && // in case a type is to be filtered in the future
        (transaction.pending === false) &&
        (transaction._account === accountId));
};
