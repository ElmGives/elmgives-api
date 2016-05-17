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

const logger = require('../logger');
const notify = require('../slack/index');

// Functions for every step
const getBankInstitution = require('./getBankInstitution');
const getNpo = require('./getNpo');
const getUsers = require('./getUsers');
const removeStripeToken = require('./removeStripeToken');
const createNewCustomer = require('./createNewCustomer');
const addCustomerIdOnDatabase = require('./addCustomerIdOnDatabase');
const getLatestTransactionHash = require(',/getLatestTransactionHash');
const getLatestTransaction = require('./getLatestTransaction');
const verifyData = require('./verifyData');
const makeDonation = require('./makeDonation');
const createNewAddress = require('./createNewAddress');

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

      // First we get the active pledge in order to query user bank type to know stripe customer
      const activePledge = user.pledges.filter(pledge => pledge.active);
      
      if (activePledge.length === 0) {
        const error = new Error(`User with ID ${user._id} has not an active pledge`);
        throw error;
      }
      
      let address = activePledge[0].addresses[0];
      let bankId = activePledge[0].bankId;
      let institution = yield getBankInstitution(bankId, processGen);
      
      if (!user.stripe[institution]) {
        const error = new Error(`User with ID ${user._id} doesn't have stripe information to proceed`);
        throw error;
      }
      
      // If the user has a stripe token, we check if (s)he has a stripe customerId
      // If a customerId is present, we remove the token because it's useless, if not, we
      // immediately create a stripe account because with the token in this state can do a lot and
      // is not safe for our user to delay that creation 
      if (user.stripe[institution].token) {
        
        if (user.stripe[institution].customer) {
          yield removeStripeToken(user, institution, processGen);
        }
        else {
          let newCustomer = yield createNewCustomer(user, processGen);
          
          user.stripe[institution].customer = newCustomer;
          
          yield addCustomerIdOnDatabase(user, institution, processGen);
          yield removeStripeToken(user, institution, processGen);
        }        
      }
      
      // Now we look for the latestTransaction which contains the balance to charge.
      // We verify it not charged yet. If it is, maybe something went wrong on the round up process or
      // user simply didn't make any use of registered account
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
      const currency = verifiedData.currency;
      const customerId = user.stripe[institution].customer.id;
      const connectedAccountId = npo.stripe.accountId;
      
      let donationSuccess = yield makeDonation(cents, currency, customerId, connectedAccountId, processGen);
      
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

module.exports = {
  run: run,
};
