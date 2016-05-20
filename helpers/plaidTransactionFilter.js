/**
 * Checks if a transaction is worth of analizing for roundup process
 * @param  {object}  A plaid transaction object received o a request to their service
 * @return {boolean}
 */

'use strict';

module.exports = function plaidTransactionFilter(transaction) {

    return (transaction && transaction.type && transaction.type.primary && 'pending' in transaction) &&
        (transaction.type.primary === 'place' || transaction.type.primary === 'digital') &&
        (transaction.pending === false);
};
