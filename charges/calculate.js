/**
 *
 */
'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');
const logger = require('../logger');
const P = require('bluebird');

const STRIPE_ACH_FEE = 0.008;           // 0.8%
const STRIPE_CC_FEE = 0.029;            // 2.9%
const ELM_ACH_FEE = 50;                 // 50 cents for ACH
const ELM_CC_FEE = 80;                  // 80 cents for Credit Cards
const centCurrencies = ['usd'];

module.exports = function calculateCharge(user, pledge, addresses, options) {
    options = typeof options === 'object' ? options : {};
    let charge = {
        amount: 0,
        currency: 'usd',
        fee: 0,
        net: 0
    };

    return P.map(addresses, address => {
            return getVerifiedAddressBalance(address)
                .catch(error => {
                    logger.error({err: error});
                });
        })
        .filter(verified => verified.address && verified.address.length)
        .then(addresses => {
            /* Calculate total charge amount */
            let roundupsAmount = addresses.map(address => Math.abs(address.balance))
                .reduce((amount1, amount2) => amount1 + amount2);
            let donationAmount = Math.min(roundupsAmount, pledge.monthlyLimit);
            if (isNaN(donationAmount) || donationAmount === 0) {
                return Promise.reject(new Error('invalid-charge-amount'));
            }
            charge.amount = donationAmount;

            /* Verify that all amounts are in the same currency */
            charge.currency = addresses.map(address => address.currency.toLowerCase())
                .reduce((currency1, currency2) => currency1 === currency2 && currency1);
            if (!charge.currency) {
                return Promise.reject(new Error('address-currencies-not-equal'));
            } else if (centCurrencies.indexOf(charge.currency) >= 0) {
                charge.amount *= 100; // convert to cents
            }

            /* Calculate charge fee */
            charge.fee = calculateFee(charge.amount, options.ach);

            console.log(charge);

            return charge;
        });
};

function calculateFee(amount, ach) {
    if (ach) {
        return Math.ceil(amount * STRIPE_ACH_FEE + ELM_ACH_FEE);
    }
    else {
        return Math.ceil(amount * STRIPE_CC_FEE + ELM_CC_FEE);
    }
}
