/**
 * Every step for this process is inside of [[executeProcess]] generator and is documented inline
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
const markTransactionAsCharged = require('./markTransactionAsCharged');

// GLOBAL VARIABLES
let processGen = null;

/**
 * Starts the process
 */
function charge() {
  logger.info('Monthly process: Started.');
  
  processGen = executeProcess();
  processGen.next();
}

/**
 * We use two try/catch on this generator, one for when our first query to User database. With this one
 * on a fail, we log the error and skip the while statement.
 * On second try/catch we wrap all the process for every person found, capturing all errors tha may be
 * thrown on throw statements. Inside helper functions we forward the errors in order to capture them
 * here
 */
function *executeProcess() {
  let users = [];
  let user = null;
  
  // We retrieve every person that has stripe and plaid attributes and are active
  try {
    users = yield getUsers(processGen);
    
    logger.info('Monthly process: Got users');
  } catch( error ) {
    logger.error({ err: error });
    users = [];
  }
    
  // Used a while instead of a loop in case we end up adding users asyncronously
  // if user database is too big to process in one swoop
  while((user = users.pop())) {
    
    try {

      // First we get the first active pledge in order to query user bank type to know stripe customer
      const activePledge = user.pledges.filter(pledge => pledge.active);
      
      if (activePledge.length === 0) {
        let error = new Error('active-pledge-not-found');
        error.status = 404;
        error.details = `User with ID ${user._id} has not an active pledge`;
        throw error;
      }
      
      let address = activePledge[0].addresses[0];
      let bankId = activePledge[0].bankId;
      let institution = yield getBankInstitution(bankId, processGen);
      
      if (!user.stripe[institution]) {
        let error = new Error('stripe-information-not-found');
        error.status = 404;
        error.details = `User with ID ${user._id} doesn't have stripe information to proceed`;
        throw error;
      }
      
      // If the user has a stripe token, we check if (s)he has a stripe customer ID
      // If a customer ID is present, we remove the token because it's useless, if not, we
      // immediately create a stripe account because with the token in this state anyone can do a lot and
      // is not safe for our user to delay that creation 
      if (user.stripe[institution].token) {
        
        if (user.stripe[institution].customer) {
          yield removeStripeToken(user, institution, processGen);
        }
        else {
          logger.info('Monthly process: Found a token and no customer on stripe. Trying to create one...');
          
          let newCustomer = yield createNewCustomer(user, processGen);
          
          logger.info('Monthly process: Created a new customer on stripe');
          
          user.stripe[institution].customer = newCustomer;
          
          yield addCustomerIdOnDatabase(user, institution, processGen);
          yield removeStripeToken(user, institution, processGen);
        }        
      }
      
      logger.info('Monthly process: Getting transaction data');
      
      // Now we look for the latestTransaction which contains the balance to charge.
      // We verify it is not charged yet. If it is, maybe something went wrong on the round up process or
      // user simply didn't make any use on registered account
      let latestTransactionHash = yield getLatestTransactionHash(address, processGen);
      let latestTransaction = yield getLatestTransaction(latestTransactionHash, processGen);
      
      // TODO: should we create a new address when we found this? or just report as it is?
      if (latestTransaction.charged) {
        notify({ text: `This transaction was already processed: ${latestTransaction.hash.value}` });
        
        let error = new Error('transaction-already-processed');
        error.status = 422;
        error.details = `This transaction was already processed: ${latestTransaction.hash.value}`;
        throw error;
      }
      
      // We verify that transaction hash is not tampered. Also that the address is derived from public key
      // we get back the address, amount to charge and currency
      let verifiedData = yield verifyData(address, processGen);
      
      if (!verifiedData) {
        let error = new Error('transaction-information-mismatch');
        error.status = 422;
        error.details = `Transaction integrity or signature doesn't match. UserId ${user._id}`;
        throw error;
      }
      
      // we verify and clamp if necessary user monthlyLimit
      let monthlyLimit = activePledge[0].monthlyLimit;
      
      if (verifyData.balance > monthlyLimit) {
        verifiedData.balance = monthlyLimit;
      }
      
      
      // every charge is in cents. We get user pledge npo object to get access to stripe connect account
      let cents = verifiedData.balance * 100;
      let npo = yield getNpo(activePledge[0].npo, processGen);
      
      if (!npo) {
        let error = new Error('pledge-name-not-found');
        error.status = 404;
        error.details = `User ${user._id}, doesn't have a valid pledge name`;
        throw error;
      }
      
      if (cents > 0) {
        logger.info('Monthly process: Making donation');
        
        // then we try to make the donation
        const currency = verifiedData.currency;
        const customerId = user.stripe[institution].customer.id;
        const connectedAccountId = npo.stripe.accountId;
        
        let donationSuccess = yield makeDonation(cents, currency, customerId, connectedAccountId, processGen);
        
        if (!donationSuccess) {
          let error = new Error('donation-failed');
          error.status = 422;
          error.details = `Donation couldn't be made for user ${user._id}`;
          throw error;
        }
      }
      
      logger.info('Monthly process: Updating transaction as processed');
      
      yield markTransactionAsCharged(latestTransaction, processGen);
      
      logger.info('Monthly process: Trying to get a new address');
      
      // Once donated, we need to request a new address for user pledge to start a new month
      const pledgeId = activePledge[0]._id;
      let newAddress = yield createNewAddress(user._id, pledgeId, monthlyLimit, processGen);
      
      if (!newAddress) {
        let error = new Error('new-address-failed');
        error.status = 422;
        error.details = `Couldn't send AWS a request for new Address for user ${user._id}`;
        throw error;
      }
      
      logger.info(`Monthly process: Process success for ${user._id}`);
      
    } catch(error) {
      logger.error({ err: error });
    }
  }
  
  logger.info('Monthly process: Finished');
}

module.exports = {
  charge: charge,
};
