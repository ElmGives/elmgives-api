'use strict';

const transactionFilter = require('./plaidTransactionFilter');
const rUAS = require('./roundAndSavePlaidTransaction');

/**
 * Filters plaid transactions, leaving out those that aren't present on user registered plaid account
 * on the app.
 * Maps every plaid transaction in plaidTransactions rounded up objects. We save them for later possible data mining
 * We filter again taking out all zero roundups
 * Lastly, we order all remaining transactions because we saw on tests they come unordered from plaid service
 * @param   {Object[]}  transactions
 * @param   {Object}    personData
 * @returns {Array}     returns an Array of plaidTransaction objects
 */
function filterMapOrderPlaidTransactions(transactions, personData) {

    return transactions.filter(transactionFilter.bind(null, personData.plaidAccountId))
        .map(rUAS.roundUpAndSave.bind(null, personData))
        .filter(plaidTransaction => plaidTransaction.roundup !== 0)
        .sort((a, b) => {
            if (a.date < b.date) { return -1; }
            if (a.date > b.date) { return 1; }
            return 0;
        });
}

module.exports = filterMapOrderPlaidTransactions;
