'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Uses Stripe API to make a donation on behalf on [[connectedStripeAccount]]
 * @param {Number}    amount
 * @param {String}    currency  'usd' for now
 * @param {String}    connectedStripeAccount
 * @param {generator} generator
 */
function makeDonation(amount, currency, customer, connectedStripeAccount, generator) {

  stripe.charges.create({
    amount: amount,
    currency: currency,
    customer: customer,
    destination: connectedStripeAccount,
    /* jshint camelcase: false */
    application_fee: 1,                       // NOTE: Not determined yet
  })
  .then(generator.next)
  .catch(generator.throw);
}

module.exports = makeDonation;
