'use strict';

/**
 * In this document User charges process is implemented.
 * This process takes every transaction from last month and make a Stripe transfer to user NPO
 */

/**
 * Load environment variables
 */
require('dotenv').config();

/**
 * MongoDB configuration
 */
require('../config/database');

const logger = require('../logger');
const getUsers = require('./getUsers');
const getBankInstitution = require('./getBankInstitution');
const removeStripeToken = require('./removeStripeToken');
const createNewCustomer = require('./createNewCustomer');
const addCustomerIdOnDatabase = require('./addCustomerIdOnDatabase');
const getAddress = require('./getAddress');
const notify = require('../slack/index');
const verifyData = require('./verifyData');
const calcFee = require('./calcFee');
const getNpo = require('./getNpo');
const makeDonation = require('./makeDonation').makeDonation;
const createCharge = require('./createCharge');
const updateAddressCharge = require('./updateAddressCharge');
const getActivePledge = require('./getActivePledge');
const getPastAddresses = require('./getPastAddresses');
const updateLastRun = require('../runs/update');

// GLOBAL VARIABLES

let minimumDonationValue = process.env.MINIMUM_DONATION;
let chargeGen = null;

/**
 * Starts the charge process
 */
function charge() {
    logger.info('Monthly charge: Started.');
    notify('Charge process starts');
    
    chargeGen = executeCharges();
    chargeGen.next();
}

/**
 * We use two try/catch on this generator, one for when we query User database. With this one
 * on a fail, we log the error and skip the while statement.
 * On second try/catch we wrap all the process for every person found, capturing all errors that may be
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
            const activePledge = getActivePledge(user.pledges, user._id);

            let addresses = getPastAddresses(activePledge);

            // If no address exists is because the user registered this month, so,
            // user has not transaction data for last month and we skip this one
            if (addresses.length === 0) {
                continue;
            }
            
            let institution = yield *getInstitution(activePledge, user, chargeGen); 
            
            yield *checkUserCustomerOnStripe(user, institution, chargeGen);
            
            logger.info('Monthly charge: Getting transaction data');

            let totalDonationAndCurrency = yield *calculateTotalAndGetCurrency(addresses, user, chargeGen);
            let totalDonation = totalDonationAndCurrency.totalDonation;
            let currency = totalDonationAndCurrency.currency;
            
            // we verify and clamp if necessary user monthlyLimit
            let monthlyLimit = activePledge.monthlyLimit;
            
            if (totalDonation > monthlyLimit) {
                totalDonation = monthlyLimit;
            }
        
            // .ach holds if we are going to charge user from credit card or savings account
            let isAchPayment = user.stripe[institution].ach;
            
            // If we can't make the minimum donation we skip this month
            if (totalDonation < minimumDonationValue) {
                continue;
            }
        
            // every charge is in cents. We get user pledge npo object to get access to stripe connect account
            let cents = Math.ceil(totalDonation * 100);
            let npo = yield *getNPO(activePledge, user._id, chargeGen);
            
            if (cents > 0) {
                logger.info('Monthly charge: Making donation');
                
                yield *donateAndUpdateAddresses(user, cents, currency, institution, isAchPayment, addresses, totalDonation, npo, chargeGen);
            }
            
            logger.info(`Monthly charge: Process success for ${user._id}`);
        
        } catch(error) {
            logger.error({ err: error });
        }
    }
    
    logger.info('Monthly charge: Finished');

    let query = {
        process: 'charge',
    };

    let newValue = {
        last: Date.now(),
    };

    updateLastRun(query, newValue);
    notify('Charge process ends');
}

/**`
 * Finds bank institution
 * @param   {object}    activePledge
 * @param   {object}    user
 * @param   {generator} chargeGen
 * @returns {String}    institution
 */
function *getInstitution(activePledge, user, chargeGen) {
    let bankId = activePledge.bankId;
    let institution = yield getBankInstitution(bankId, chargeGen);
    
    if (!user.stripe[institution]) {

        let error = new Error('stripe-information-not-found');
        error.status = 404;
        error.details = `User with ID ${user._id} doesn't have stripe information to proceed`;
        throw error;
    }

    return institution;
}

/**
 * If the user has a stripe token, we check if (s)he has a stripe customer ID
 * If a customer ID is present, we remove the token because it's useless, if not, we
 * immediately create a stripe account because with the token in this state anyone can do a lot and
 * is not safe for our user to delay that creation
 * @param   {object}    user
 * @param   {String}    institution
 * @param   {generator} chargeGen
 * @returns {undefined}
 */
function *checkUserCustomerOnStripe(user, institution, chargeGen) {

     
    if (user.stripe[institution].token) {
        
        if (user.stripe[institution].customer) {
            yield removeStripeToken(user, institution, chargeGen);
        }
        else {
            logger.info('Monthly charge: Found a token and no customer on stripe. Trying to create one...');
            
            const token = user.stripe[institution].token;
            let newCustomer = yield createNewCustomer(user, token, chargeGen);

            logger.info(`Monthly charge: Created a new customer on stripe with ID ${newCustomer.id} for user ${user._id}`);
            
            user.stripe[institution].customer = newCustomer;
            
            yield addCustomerIdOnDatabase(user, institution, chargeGen);
            yield removeStripeToken(user, institution, chargeGen);
        }        
    }

    return;
}

/**
 * Calculates total amount for donation and the currency of this
 * @param   {String[]}  addresses
 * @param   {object}    user
 * @param   {generator} chargeGen
 * @returns {Object}                Total donation and currency
 */
function *calculateTotalAndGetCurrency(addresses, user, chargeGen) {
    let totalDonation = 0;
    let currency = null;
    
    for (let index = 0; index < addresses.length; index += 1) {
        let currentAddress = addresses[index];
        let addressObject = yield getAddress(currentAddress, chargeGen);

        if (index === 0) {

            // Now we look for the latestTransaction which contains the balance to charge.
            // We verify it is not charged yet. If it is, maybe something went wrong on the round up process or
            // user simply didn't make any use on registered account
            if (!addressObject.latestTransaction) {

                let error = new Error('not-valid-address');
                error.status = 422;
                error.details = `Invalid address record (has no latestTransaction property): ${addressObject}`;
                throw error;
            }

            if (addressObject.charge) {
                notify({ text: `Charge process: This address was already charged: ${addressObject.address}` });
                
                let error = new Error('address-already-processed');
                error.status = 422;
                error.details = `This address was already charged: ${addressObject.address}`;
                throw error;
            }

            let verifiedData = yield verifyData(currentAddress, chargeGen);
                currency = verifiedData.currency;
            
            if (!verifiedData) {
                let error = new Error('transaction-information-mismatch');
                error.status = 422;
                error.details = `Transaction integrity or signature doesn't match. UserId ${user._id}`;
                throw error;
            }
            
            totalDonation += Math.abs(verifiedData.balance);

        // If we have two months ago information, we get that latestTransaction to know if that transaction
        // was processed. If it was, nothing happens, but if it wasn't (because that time donation was too low)
        // we add it to this month donation (a carry operation) 
        } else if (!addressObject.charge) {
            let verifiedData = yield verifyData(currentAddress, chargeGen);

            if (verifiedData) {
                totalDonation += verifiedData.balance;
            }
        }
    }

    return {
        totalDonation: totalDonation,
        currency: currency,
    };
}

/**
 * Returns NPO from activePledge
 * @param   {object}    activePledge
 * @param   {String}    userId
 * @param   {generator} chargeGen
 * @returns {Object}    npo
 */
function *getNPO(activePledge, userId, chargeGen) {
    let npo = yield getNpo(activePledge.npoId, chargeGen);
            
    if (!npo) {
        let error = new Error('pledge-not-found');
        error.status = 404;
        error.details = `User ${userId} pledge doesn't exist or doesn't have a pledge account ID`;
        throw error;
    }

    return npo;
}

/**
 * Makes donation and updates the addresses with charge ID
 * @param   {object}    user
 * @param   {String}    currency
 * @param   {String}    institution
 * @param   {Boolean}   isAchPayment
 * @param   {String[]}  addresses
 * @param   {Number}    totalDonation
 * @param   {object}    npo
 * @param   {generator} chargeGen
 * @returns {undefined}
 */
function *donateAndUpdateAddresses(user, cents, currency, institution, isAchPayment, addresses, totalDonation, npo, chargeGen) {

    // then we try to make the donation
    const customerId = user.stripe[institution].customer.id;
    const connectedAccountId = npo.stripe.accountId;
    const fee = Math.ceil(calcFee(cents, isAchPayment));  // because we are in cents, we roundup to next cent
    const net = +(totalDonation - fee/100).toFixed(2);
    const description = npo.name ? `Donation to ${npo.name}` : '';

    let report = {
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        fee,
        net, 
        ach: isAchPayment
    };

    let donationSuccess = yield makeDonation(cents, currency, customerId, connectedAccountId, fee, description, chargeGen);
    
    if (!donationSuccess) {
        let error = new Error('donation-failed');
        error.status = 422;
        error.details = `Donation could not be made for user ${user._id}`;
        throw error;
    }
    
    logger.info('Monthly charge: Updating transaction as processed');
    
    // we add a new Charge element for this donation
    const charge = yield createCharge(
        addresses,
        totalDonation,
        currency,
        user._id,
        npo._id,
        report,
        chargeGen
    );
    
    // Then update the addresses for this donation with the new Charge ID
    for (let currentAddress of addresses) {
        yield updateAddressCharge(currentAddress, charge._id, chargeGen);
    }

    return;
}

module.exports = charge;