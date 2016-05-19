'use strict';

const createStripeCustomer = require('../plaid/link/exchange').createStripeCustomer;

/**
 * We create a new Stripe customer on ELM dashboard
 * @param {object}    user
 * @param {String}    token     Stripe token
 * @param {generator} generator
 */
function createNewCustomer(user, token, generator) {
  
  createStripeCustomer(user, token)
    .then(generator.next)
    .catch(generator.throw);
}

module.exports = createNewCustomer;
