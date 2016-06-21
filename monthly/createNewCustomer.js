'use strict';

const createStripeCustomer = require('../plaid/link/exchange').createStripeCustomer;

/**
 * We create a new Stripe customer on ELM dashboard
 * @param   {object}    user
 * @param   {String}    token     Stripe token
 * @param   {generator} generator
 * @returns {promise}
 */
function createNewCustomer(user, token, generator) {
  
  return createStripeCustomer(user, token)
    .then(customer => generator.next(customer))
    .catch(error => generator.throw(error));
}

module.exports = createNewCustomer;
