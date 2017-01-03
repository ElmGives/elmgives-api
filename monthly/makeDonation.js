'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Uses Stripe API to make a donation on behalf on [[connectedStripeAccount]]
 * @param {Number}    amount
 * @param {String}    currency                'usd' for now
 * @param {String}    connectedStripeAccount

 * @param {generator} generator
 */
function makeDonation(amount, currency, customer, connectedStripeAccount, fee, description, generator) {

  stripe.charges.create({
    amount: amount,
    currency: currency,
    customer: customer,
    destination: connectedStripeAccount,
    description: description,
    /* jshint camelcase: false */
    application_fee: fee,
  }, function(error, charge) {
    
    if (error)  {
      generator.throw(error);
    }
    else {
      generator.next(charge);
    }
    
  });
}

module.exports = {
  makeDonation: makeDonation,
  _stripe: stripe,
};
