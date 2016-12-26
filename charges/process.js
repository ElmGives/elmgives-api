/**
 * 
 */
'use strict';

const logger = require('../logger');
const StripeCharge = require('./charge-stripe');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const centCurrencies = ['usd'];

module.exports = function processCharge(charge, customer, params) {
    customer = typeof customer === 'object' ? customer : {};
    params = typeof params === 'object' ? params : {};

    if (!charge || typeof charge.validate !== 'function') {
        let error = new Error();
        error.message = 'invalid-charge-document';
        return Promise.reject(error);
    }

    return new Promise((reject, resolve) => {
        return charge.validate(error => {
            if (error) { return reject(error); }

            return StripeCharge.findOne({chargeId: charge._id})
                .then(stripeCharge => {
                    if (stripeCharge) {
                        let error = new Error();
                        error.message = 'charge-already-processed';
                        return reject(error);
                    }

                    return processStripeCharge(charge, customer, params);
                })
                .then(resolve);
        });
    });
};

function processStripeCharge(charge, customer, params) {
    let stripeChargeParams = Object.assign({
        amount: charge.amount,
        currency: charge.currency,
        customer: customer.id
    }, params);

    if (centCurrencies.indexOf(stripeChargeParams.currency) >= 0) {
        stripeChargeParams.amount *= 100; // convert to cents
        /* jshint camelcase: false */
        stripeChargeParams.application_fee *= 100;
        stripeChargeParams.amount = Math.round(stripeChargeParams.amount);
        stripeChargeParams.application_fee = Math.round(stripeChargeParams.application_fee);
    }

    return stripe.charges.create(stripeChargeParams)
        .then(stripeCharge => {
            charge.status = 'processed';

            let stripeChargeDocumentParams = Object.assign({}, stripeChargeParams);
            stripeChargeDocumentParams.stripeId = stripeCharge.id;
            stripeChargeDocumentParams.chargeId = charge._id;
            let stripeChargeDocument = StripeCharge.create(stripeChargeDocumentParams);

            return Promise.all([
                charge.save(),
                stripeChargeDocument
            ]);
        })
        .catch(error => {
            logger.error({err: error});

            charge.status = 'failed';
            return charge.save();
        });
}
