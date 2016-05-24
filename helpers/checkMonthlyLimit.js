'use strict';

/**
 * For every transaction received from Plaid service, we check if it more or equal to user [[monthlyLimit]]
 * For this, we have to take accumulated value from previous transactions chain and compare. If we are
 * already on the limit, we discard new plaidTransactions because they will not matter. In fact, they'll be 
 * noise if we send zero value round ups
 * @param   {Object}    personData
 * @param   {object}    plaidTransactions
 * @param   {object}    previousChain
 * @returns {Array}     [previousChain, plaidTransactions] 
 */
function checkMonthlyLimit(personData, plaidTransactions, previousChain) {
    const monthlyLimit = personData.limit;
    let verifiedPladiTransactions = [];
    
    let accumulatedBalance = previousChain.payload.balance;
    
    // Balance comes with negative values, so we turn it into a positive one for easy reasoning
    if (accumulatedBalance < 0) {
        accumulatedBalance *= -1;
    }
    
    for (let plaidTransaction of plaidTransactions) {
        
        accumulatedBalance += plaidTransaction.roundup;
        
        if (accumulatedBalance < monthlyLimit) {    
            verifiedPladiTransactions.push(plaidTransaction);
        }
        else {
            accumulatedBalance -= plaidTransaction.roundup;
        }
    }
    
    return [previousChain, verifiedPladiTransactions];
}

module.exports = checkMonthlyLimit;

