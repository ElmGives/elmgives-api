'use strict';

/**
 * Fees:
 *   Plaid Auth: $1.25/user (one time fee)
 *   Plaid Connect: $0.25/user (per month)
 *   Stripe (Conventional): 2.9%/transaction + 0.30 cents
 *   Stripe (ACH): 0.80% / transaction
 * 
 * Case 1: User forgoes ACH donations
 *   Fees paid:
 *     2.9%/donation + 0.30 cents
 *     0.25 cents / user / month
 * 
 *   Elm Fee:
 *     2.9% + $0.80 cents per donation
 * 
 * Case 2: User opts in for ACH donations
 *   Fees paid:
 *     0.8% / donation
 *     $0.25 cents / user / month
 *     $1.25 / user (one time)
 * 
 *   Elm fee:
 *     0.8% + $0.50 per donation
 * 
 *   Elm collects$1.25 per donor from nonprofit
 */

const STRIPE_ACH_FEE = 0.008;           // 0.8%
const STRIPE_CONVENTIONAL_FEE = 0.029;  // 2.9%
const ELM_ACH_FEE = 50;                 // 50 cents
const ELM_CONVENTIONAL_FEE = 80;        // 80 cents 

/**
 * Calculates what stripe fee parameter should be used when making payments
 * @param   {Number}    amount          What is going to be charged to user in cents
 * @param   {boolean}   isAchPayment    false if it is a credit card charge
 * @returns {Number}                    actual fee
 */
function calcStripeFee(amount, isAchPayment) {
    
    if (isAchPayment) {
        return Math.ceil(amount * STRIPE_ACH_FEE + ELM_ACH_FEE);
    }
    else {
        return Math.ceil(amount * STRIPE_CONVENTIONAL_FEE + ELM_CONVENTIONAL_FEE);
    }
}

module.exports = calcStripeFee;
