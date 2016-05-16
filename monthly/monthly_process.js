/**
 * STEPS:
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
 *   - Save new [[address]] on User NPO (this is done by pledge manager)
 *   - Create a new [[address]] on Addresses. This adds a previous transaction with zero value (this is done by pledge manager)
 * 
 * On any fail log error
 */
'use strict';

const Npos = require('../npos/npo');
const Users = require('../users/user');
const logger = require('../logger');
const getAddress = require('../addresses/read');
const getTransaction = require('../transactions/read');
const notify = require('../slack/index');

const aws = require('../lib/awsQueue');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
 * Every step in this process is documented inline
 */
function *executeProcess() {
  let users = [];
  let user = null;
  
  // We retrieve every person that has stripe and plaid attributes and are active
  try {
    users = yield getUsers(processGen);
  } catch( error ) {
    logger.error({ err: error });
    users = [];
  }
    
  // Used a while instead of a loop in case we end up adding users asyncronously
  // if user database is too big to process in one swoop
  while((user = users.pop())) {
    
    try {
      
      // If the user has a stripe token, we check if (s)he has a stripe customerId
      // If a customerId is present, we remove the token because it's useless, if not, we
      // immediately create a stripe account because with the token in this state can do a lot and
      // is not safe for our user to delay that creation 
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
      
      // Now we look for the latestTransaction which contains the balance to charge.
      // We verify it not charged yet. If it is, maybe something went wrong on the round up process or
      // user simply didn't make any use of registered account
      let address = user.pledges[0].addresses[0];
      let latestTransactionHash = yield getLatestTransactionHash(address, processGen);
      let latestTransaction = yield getLatestTransaction(latestTransactionHash, processGen);
      
      if (latestTransaction.charged) {
        notify({ text: `This transaction was already processed: ${latestTransaction.hash.value}` });
        
        let error = new Error(`This transaction was already processed: ${latestTransaction.hash.value}`);
        throw error;
      }
      
      // We verify that transaction hash is not tampered. Also that the address is derived from public key
      // we get the address, amount to charge and currency
      let verifiedData = yield verifyData(address, processGen);
      
      if (!verifiedData) {
        let error = new Error('Transaction integrity or signature don\'t match');
        throw error;
      }
      
      // we verify and clamp if necessary user monthlyLimit
      let monthlyLimit = user.pledges[0].monthlyLimit;
      
      if (verifyData.balance > monthlyLimit) {
        verifiedData.balance = monthlyLimit;
      }
      
      // every charge is in cents and get user pledge npo object to get access to stripe connect account
      let cents = verifiedData.balance * 100;
      let npo = yield getNpo(user.pledges[0].npo, processGen);
      
      if (!npo) {
        let error = new Error(`User ${user._id}, doesn't have a valid pledge name`);
        throw error;
      }
      
      // then we try to make the donation
      let donationSuccess = yield makeDonation(cents, verifiedData.currency, user.stripe.customerId, npo.stripe.accountId, processGen);
      
      if (!donationSuccess) {
        let error = new Error(`Donation couldn't be made for user ${user._id}`);
        throw error;
      }
      
      // Once donated, we need to request a new address for user pledge to start a new month
      const pledgeId = user.pledges[0]._id;
      let newAddress = yield createNewAddress(user._id, pledgeId, monthlyLimit, processGen);
      
      if (!newAddress) {
        let error = new Error(`Couldn't send AWS request for new Address for user ${user._id}`);
        throw error;
      }
    } catch(error) {
      logger.error({ err: error });
    }
  }
} 

/**
 * Finds all NPOs that have a Stripe accountId for making payments on their accouts
 * We store this list on a global variable for later. We could pass this list between functions but
 * that would make the code difficult to read. When using nodejs v6+ this can be achieved using destructuring
 * @param {generator} generator
 */
function getNpo(npoName, generator) {
  const query = {
    name: npoName,
    active: true,
    'stripe.accountId': {
      $exists: true,
    },
  };
    
  const selector = {
    stripe: 1,
    name: 1,
  };
    
  Npos
    .findOne(query, selector)
    .exec()                     // this forces to return a real Promise
    .then( npo => generator.next(npo))
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
    pledges: 1,
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
  
  // Implemented in https://github.com/ElmGives/elmgives-api/pull/41 not yet merged
  generator.next(true);
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

/**
 * Verifies integrity of every transaction componenet is to be trusted
 * @param {String}    address
 * @param {generator} generator
 */
function verifyData(address, generator) {
  // Implemented in https://github.com/ElmGives/elmgives-api/pull/42 but not merged yet
  generator.next(true);
}

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
  }).then(() => generator.next(true))
  .catch(error => generator.throw(error));
}

/**
 * Address manager is in charge to add a new Address on Addresses collection and to update
 * User pledges address which is signaled with the sendMessage function
 * @param {String}    userId
 * @param {String}    pledgeId
 * @param {Number}    monthlyLimit
 * @param {generator} generator
 */
function createNewAddress(userId, pledgeId, monthlyLimit, generator) {
  
  aws.sendMessage({
    userId: userId,
    pledgeId: String(pledgeId),
    limit: monthlyLimit,
    nonce: String((new Date()).getTime())
  }, {
    queue: process.env.AWS_SQS_URL_ADDRESS_REQUESTS
  })
  .then(() => generator.next(true))
  .catch(error => generator.throw(error));
}

module.exports = {
  run: run,
};
