/**
 *
 */
'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');
const logger = require('../logger');
const P = require('bluebird');

const STRIPE_ACH_FEE = 0.008;      // 0.8%
const STRIPE_CC_FEE = 0.029;       // 2.9%
const ELM_ACH_FEE = 0.5;           // 50 cents for ACH
const ELM_CC_FEE = 0.8;            // 80 cents for Credit Cards

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
                .reduce((amount1, amount2) => +(amount1 + amount2).tofixed(2));
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
            }

            /* Calculate charge fee */
            charge.fee = calculateFee(charge.amount, options.ach);
            charge.net = +(charge.amount - charge.fee).toFixed(2);

            return charge;
        });
};

function calculateFee(amount, ach) {
    let fee;

    if (ach) {
        fee = amount * STRIPE_ACH_FEE + ELM_ACH_FEE;
    }
    else {
        fee = amount * STRIPE_CC_FEE + ELM_CC_FEE;
    }

    return +fee.toFixed(2);
}
