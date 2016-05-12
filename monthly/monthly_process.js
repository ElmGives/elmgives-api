/**
 * STEPS:
 * - Get NPOs, by [['stripe.accountId']] and [[active]]
 * - Get Users with [[stripe]] attribute and a value different from default
 * - Filter out those users with [[stripe.token]] attribute
 *   - If they have a [[CustomerId]] attibute, then delete the token
 *   - If they doesn't have a [[CustomerId]] attribute, create one
 * - For each user:
 *   - Take [[address]] from [[pledges]] attribute
 *   - Search on Addresses and take [[latestTransaction]] attribute
 *   - Search on Transactions for [[latestTransaction]] hash value
 *   - If this [[transaction]] is already processed, notify?
 *   - Check if data is valid (Jorge's process)
 *   - Check [[user]] top donation ammount
 *       - Clamp donation if needed
 *   - If everything is good, make donation (remember donations are in cents)
 *   - Request a new [[address]]
 *   - Save new [[address]] on User NPO 
 *   - Create a new [[address]] on Addresses. This adds a previous transaction with zero value
 * 
 * On any fail log error
 */
'use strict';

const Npos = require('../npos/npo');
const Users = require('../users/user');
const logger = require('../logger');

// GLOBAL VARIABLES
let NPOs = null;

/**
 * Starts the process
 */
function run() {
    
  getNpos()
    .then(getUsers)
    .then(/* TODO: continue here */)
    .catch( error => logger.error({ err: error }));
}

/**
 * Finds all NPOs that have a Stripe accountId for making payments on their accouts
 * We store this list on a global variable for later. We could pass this list between functions but
 * that would make the code difficult to read. When using nodejs v6+ this can be achieved using destructuring
 * @returns {Promise<Array>}
 */
function getNpos() {
  const query = {
    active: true,
    'stripe.accountId': {
      $exists: true,
    },
  };
    
  const selector = {
    stripe: 1,
  };
    
  return Npos
    .find(query, selector)
    .exec()                     // this forces to return a real Promise
    .then( npos => {
      NPOs = npos;
            
      return npos;
  });
}

/**
 * We retrieve all users that have a [[Stripe]] attribute, either a [[token]] or a [[CustomerId]]
 * @returns {Promise<Array>}
 */
function getUsers() {
    const query = {
      active: true,
      'stripe': {
        $exists: true,
      },
    };
    
    const selector = {
      stripe: 1,
    };
    
    return Users
      .find(query, selector)
      .exec();
}

module.exports = {
  run: run,
};
