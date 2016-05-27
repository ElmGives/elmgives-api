'use strict';

const STRIPE_ACH_FEE = 0.008;           // 0.8%
const STRIPE_CREDIT_CARD_FEE = 0.029;   // 2.9%
const STRIPE_CREDIT_CARD_MINIMUM = 0.3;
const ELM_FEE = 0;                      // TODO: Not yet defined 

/**
 * Calculates what stripe fee parameter should be when making payments
 * @param   {Number}    amount          What is going to be charged to user
 * @param   {boolean}   isAchPayment    false if it is a credit card charge
 * @returns {Number}                    actual fee
 */
function calcStripeFee(amount, isAchPayment) {
    
    if (isAchPayment) {
        return amount * STRIPE_ACH_FEE + ELM_FEE;
    }
    else {
        return amount * STRIPE_CREDIT_CARD_FEE + STRIPE_CREDIT_CARD_MINIMUM + ELM_FEE;
    }
}

module.exports = calcStripeFee;
