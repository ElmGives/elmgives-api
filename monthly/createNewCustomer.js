'use strict';

/**
 * We create a new Stripe customer on ELM dashboard
 * @param {object}    user
 * @param {generator} generator
 */
function createNewCustomer(user, generator) {
  
  // Implemented in https://github.com/ElmGives/elmgives-api/pull/41 not yet merged
  generator.next(true);
}

module.exports = createNewCustomer;
