/**
 * In this document is coded two monthly processes:
 * - User charges. This process takes every transaction from last month and make a Stripe transfer
 * - Address assignement. This process assigns a new address for every user when a new month start
 */
'use strict';

/**
 * Load environment variables
 */
require('dotenv').config();

/**
 * MongoDB configuration
 */
require('../config/database');

const logger = require('../logger');
const notify = require('../slack/index');
const getYearMonth = require('../helpers/getYearMonth');

// Functions for every step
const getBankInstitution = require('./getBankInstitution');
const getNpo = require('./getNpo');
const getUsers = require('./getUsers');
const getAddress = require('./getAddress');
const removeStripeToken = require('./removeStripeToken');
const createNewCustomer = require('./createNewCustomer');
const addCustomerIdOnDatabase = require('./addCustomerIdOnDatabase');
const verifyData = require('./verifyData');
const makeDonation = require('./makeDonation').makeDonation;
const createNewAddress = require('./createNewAddress').createNewAddress;
const addCharge = require('./addCharge');
const updateAddress = require('./updateAddress');
const calcFee = require('./calcFee');

let MINIMUM_DONATION_VALUE = null;

// GLOBAL VARIABLES
let chargeGen = null;
let addressGen = null;

/**
 * Starts the process
 */
function charge() {
  logger.info('Monthly charge: Started.');
  
  chargeGen = executeCharges();
  chargeGen.next();
}

/**
 * We use two try/catch on this generator, one for when our first query to User database. With this one
 * on a fail, we log the error and skip the while statement.
 * On second try/catch we wrap all the process for every person found, capturing all errors tha may be
 * thrown on throw statements. Inside helper functions we forward the errors in order to capture them
 * here
 */
function *executeCharges() {
  let users = [];
  let user = null;
  
  // We retrieve every person that has stripe and plaid attributes and are active
  try {
    users = yield getUsers(chargeGen);
    
    logger.info('Monthly charge: Got users');
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

      // We need to get transactions for last month
      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      let lastMonth = getYearMonth(date);
      let address = activePledge[0].addresses[lastMonth];
      
      // If the address doesn't exists is because the user registered this month, so,
      // user has not transaction data for last month and we skip this one
      if (!address) {
        continue;
      }

      // We try to get transactions for two months in the past
      date.setMonth(date.getMonth() - 1);
      let twoMonthsBack = getYearMonth(date);
      let twoMonthsBackAddress = activePledge[0].addresses[twoMonthsBack];
      
      let bankId = activePledge[0].bankId;
      let institution = yield getBankInstitution(bankId, chargeGen);
      
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
          yield removeStripeToken(user, institution, chargeGen);
        }
        else {
          logger.info('Monthly charge: Found a token and no customer on stripe. Trying to create one...');
          
          const token = user.stripe[institution].token;
          let newCustomer = yield createNewCustomer(user, token, chargeGen);
          
          logger.info('Monthly charge: Created a new customer on stripe');
          
          user.stripe[institution].customer = newCustomer;
          
          yield addCustomerIdOnDatabase(user, institution, chargeGen);
          yield removeStripeToken(user, institution, chargeGen);
        }        
      }
      
      logger.info('Monthly charge: Getting transaction data');
      
      let totalDonation = 0;
      
      // If we have two months ago information, we get that latestTransaction to know if that transaction
      // was processed. If it was, nothing happens, but if it wasn't (because that time donation was to low)
      // we add it to this month donation (a carry operation) 
      if (twoMonthsBackAddress) {
        let twoMonthsAddressObject = yield getAddress(twoMonthsBackAddress, chargeGen);
       
        if (!twoMonthsAddressObject.charge) {
          let twoMonthsVerifiedData = yield verifyData(twoMonthsBackAddress, chargeGen);
          
          if (twoMonthsVerifiedData) {
            totalDonation += twoMonthsVerifiedData.balance;
          } 
        }  
      }
      
      // Now we look for the latestTransaction which contains the balance to charge.
      // We verify it is not charged yet. If it is, maybe something went wrong on the round up process or
      // user simply didn't make any use on registered account
      let addressObject = yield getAddress(address, chargeGen);
      
      if (!addressObject.latestTransaction) {
        let error = new Error('not-valid-address');
        error.status = 422;
        error.details = `What got is not a valid address: ${addressObject}`;
        throw error;
      }
      
      if (addressObject.charge) {
        notify({ text: `This address was already charged: ${addressObject.address}` });
        
        let error = new Error('address-already-processed');
        error.status = 422;
        error.details = `This address was already charged: ${addressObject.address}`;
        throw error;
      }
      
      // We verify that transaction hash is not tampered. Also that the address is derived from public key
      // we get back the address, amount to charge and currency
      let verifiedData = yield verifyData(address, chargeGen);
      
      if (!verifiedData) {
        let error = new Error('transaction-information-mismatch');
        error.status = 422;
        error.details = `Transaction integrity or signature doesn't match. UserId ${user._id}`;
        throw error;
      }
      
      totalDonation += verifiedData.balance;
      
      // we verify and clamp if necessary user monthlyLimit
      let monthlyLimit = activePledge[0].monthlyLimit;
      
      if (totalDonation > monthlyLimit) {
        totalDonation = monthlyLimit;
      }
      
      let isAchPayment = user.stripe[institution].ach;
      
      MINIMUM_DONATION_VALUE = calcFee(totalDonation, isAchPayment);
      
      // If we can't make the minimum donation we skip this month
      if (totalDonation < MINIMUM_DONATION_VALUE) {
        continue;
      }
      
      // every charge is in cents. We get user pledge npo object to get access to stripe connect account
      let cents = totalDonation * 100;
      let npo = yield getNpo(activePledge[0].npo, chargeGen);
      
      if (!npo) {
        let error = new Error('pledge-name-not-found');
        error.status = 404;
        error.details = `User ${user._id}, doesn't have a valid pledge name`;
        throw error;
      }
      
      if (cents > 0) {
        logger.info('Monthly charge: Making donation');
        
        // then we try to make the donation
        const currency = verifiedData.currency;
        const customerId = user.stripe[institution].customer.id;
        const connectedAccountId = npo.stripe.accountId;
        const fee = calcFee(cents, isAchPayment) | 0;             // We need just the integer in cents 
        
        let donationSuccess = yield makeDonation(cents, currency, customerId, connectedAccountId, fee, chargeGen);
        
        if (!donationSuccess) {
          let error = new Error('donation-failed');
          error.status = 422;
          error.details = `Donation couldn't be made for user ${user._id}`;
          throw error;
        }
        
        logger.info('Monthly charge: Updating transaction as processed');
        
        // we add a new Charge for this donation
        const charge = yield addCharge([address, twoMonthsBackAddress], totalDonation, verifiedData.currency, chargeGen);
        
        // Then update the addresses for this donation with the new Charge ID
        yield updateAddress(address, charge._id);
        
        if (twoMonthsBackAddress) {
          yield updateAddress(twoMonthsBackAddress, charge._id);
        }
      }
      
      logger.info(`Monthly charge: Process success for ${user._id}`);
      
    } catch(error) {
      logger.error({ err: error });
    }
  }
  
  logger.info('Monthly charge: Finished');
}

/**
 * Starts the executeAddressAssign generator
 */
function assignNewAddress() {
  logger.info('Monthly address assignement: started');
  
  addressGen = executeAddressAssign();
  addressGen.next();
}

/**
 * Every step is documented inline
 */
function *executeAddressAssign() {
  let users = [];
  let user = null;
  
  // We retrieve every person that has stripe and plaid attributes and are active
  try {
    users = yield getUsers(addressGen);
    
    logger.info('Monthly address assignement: Got users');
  } catch( error ) {
    logger.error({ err: error });
    users = [];
  }
  
  // Used a while instead of a loop in case we end up adding users asyncronously
  // if user database is too big to process in one swoop
  while((user = users.pop())) {
    
    try {
      logger.info('Monthly address assignement: Trying to get a new address');
      
      // First we get the first active pledge
      const activePledge = user.pledges.filter(pledge => pledge.active);
      
      if (activePledge.length === 0) {
        let error = new Error('active-pledge-not-found');
        error.status = 404;
        error.details = `User with ID ${user._id} has not an active pledge`;
        throw error;
      }
      
      // we check user doesn't have already an address for this month. If it exists, we skip the process
      let date = new Date();
      let thisMonth = getYearMonth(date);
      let existentAddress = activePledge[0].addresses[thisMonth];
      
      if (existentAddress) {
        logger.info(`Monthly address assignement: User ${user._id} already has an address.`);
        continue;
      }
      
      // We need to request a new address for active user pledge to start a new month
      const pledgeId = activePledge[0]._id;
      const monthlyLimit = activePledge[0].monthlyLimit;
      let newAddress = yield createNewAddress(user._id, pledgeId, monthlyLimit, addressGen);
      
      if (!newAddress) {
        let error = new Error('new-address-failed');
        error.status = 422;
        error.details = `Couldn't send AWS a request for new Address for user ${user._id}`;
        throw error;
      }
      
      logger.info('Monthly address assignement: Address created successfully.');
    } catch(error) {
      logger.error({ err: error });
    }
  }
  
  logger.info('Monthly address assignement: Finished');
}

module.exports = {
  charge: charge,
  assignNewAddress: assignNewAddress,
};
