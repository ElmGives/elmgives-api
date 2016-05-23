'use strict';

/**
 * For every transaction received from Plaid service, we check if it more or equal to user [[monthlyLimit]]
 * For this, we have to take accumulated value from previous transactions chain and compare. If we are
 * already on the limit, we set new round ups to zero in order to guarantee that we are not charging more
 * than said limit
 * @param   {Object}    personData
 * @param   {object}    plaidTransactions
 * @param   {object}    previousChain
 * @returns {Array}     [previousChain, plaidTransactions] 
 */
function checkMonthlyLimit(personData, plaidTransactions, previousChain) {
    const monthlyLimit = personData.limit;
    
    let previousAccumulatedRoundUps = previousChain.payload.roundup;
    
    for (let plaidTransaction of plaidTransactions) {
        
        if (previousAccumulatedRoundUps >= monthlyLimit) {
            plaidTransaction.roundup = 0;
        }
        else {
            previousAccumulatedRoundUps += plaidTransaction.roundup;
        }
    }
    
    return [previousChain, plaidTransactions];
}

module.exports = checkMonthlyLimit;

// TODO: Crear el test para este helper
// TODO: Create Charges Model:
//  [Addresses]
//  amount
//  currency
//  timeStamp
// TODO: Address will hage a `charge` property
// TODO: Balance is negative
// TODO: Call previuos at the beginning so we can skip if already reached monthly limit