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
const getAddress = require('../addresses/read');
const getTransaction = require('../transactions/read');

// GLOBAL VARIABLES
let processGen = null;

/**
 * Starts the process
 */
function run() {
  
  processGen = executeProcess();
  processGen.next();
}

/**
 * List every step from above, It 'waits' for creation of a Stripe customer when he doesn't exist
 */
function *executeProcess() {
  
  try {
    let npos = yield getNpos(processGen);
    let users = yield getUsers(processGen);
    let user = null;
    
    // Used a while instead of a loop in case we end up adding users asyncronously
    // if user database is too big to process in one swoop
    while((user = users.pop())) {
      
      if (user.stripe.token) {
        
        if (user.stripe.customerId) {
          yield removeStripeToken(user, processGen);
        }
        else {
          let newCustomer = yield createNewCustomer(user, processGen);
          
          user.stripe.customerId = newCustomer;
          
          yield addCustomerIdOnDatabase(user, processGen);
          yield removeStripeToken(user, processGen);
        }        
      }
      
      let address = user.pledges[0].addresses[0];
      let latestTransactionHash = yield getLatestTransactionHash(address, processGen);
      let latestTransaction = yield getLatestTransaction(latestTransactionHash, processGen);
      
      // TODO: continue with - If this [[transaction]] is already processed, notify?
    }
  } catch( error ) {
    logger.error({ err: error });
  }
  
  
} 

/**
 * Finds all NPOs that have a Stripe accountId for making payments on their accouts
 * We store this list on a global variable for later. We could pass this list between functions but
 * that would make the code difficult to read. When using nodejs v6+ this can be achieved using destructuring
 * @param {generator} generator
 */
function getNpos(generator) {
  const query = {
    active: true,
    'stripe.accountId': {
      $exists: true,
    },
  };
    
  const selector = {
    stripe: 1,
  };
    
  Npos
    .find(query, selector)
    .exec()                     // this forces to return a real Promise
    .then( npos => generator.next(npos))
    .catch(error => generator.throw(error));
}

/**
 * We retrieve all users that have a [[Stripe]] attribute with either a [[token]] or a [[CustomerId]]
 * and those that have a [[pledges]] attribute
 * @param {generator} generator
 */
function getUsers(generator) {
  const query = {
    active: true,
    'stripe': {
      $exists: true,
    },
    'pledges': {
      $exists: true,
    },
  };
  
  const selector = {
    stripe: 1,
  };
  
  Users
    .find(query, selector)
    .exec()
    .then(users => generator.next(users))
    .catch(error => generator.throw(error));
}

/**
 * We remove [[token]] attribute when we are certain that a user has a [[stripe.customerId]] because
 * it's useless once [[customerId]] is created
 * @param {object}    user
 * @param {generator} generator
 */
function removeStripeToken(user, generator) {
  const query = {
    _id: user._id,
  };
  
  const action = {
    $unset: {
      'stripe.token': '',
    },
  };
  
  Users
    .update(query, action)
    .exec()
    .then(users => generator.next(users))
    .catch(error => generator.throw(error));
}

/**
 * We create a new Stripe customer on ELM dashboard
 * @param {object}    user
 * @param {generator} generator
 */
function createNewCustomer(user, generator) {
  
  // TODO: find out if this helper function is already on develop
  generator.next(1);
}

/**
 * Add on Users collection [[customerId]] property
 * @param {object}    user
 * @param {generator} generator
 */
function addCustomerIdOnDatabase(user, generator) {
  const query = {
    _id: user._id,
  };
  
  const action = {
    $set: {
      'stripe.customerId': user.stripe.customerId,
    },
  };
  
  Users
    .update(query, action)
    .exec()
    .then(users => generator.next(users))
    .catch(error => generator.throw(error));
}

/**
 * Finds hash for [[latestTransaction]] on address collection in order to find the transaction later
 * @param {String}    address
 * @param {generator} generator
 */
function getLatestTransactionHash(address, generator) {
  const query = {
    address: address,
  };
  
  getAddress(query)
    .then(addressWithLatestTransaction => {
      
      if (!addressWithLatestTransaction) {
        let error = new Error('Address not found');
        generator.throw(error);
      }
      
      generator.next(addressWithLatestTransaction.latestTransaction);
    });
}

/**
 * We get a transaction from a hash
 * @param {String}    hash
 * @param {generator} generator
 */
function getLatestTransaction(hash, generator) {
  const query = {
    'hash.value': hash,
  };
  
  getTransaction(query)
    .then(transaction => {
      
      if (!transaction) {
        let error = new Error('Latest transaction not found');
        generator.throw(error);
      }
      
      generator.next(transaction);
    });
}

module.exports = {
  run: run,
};
