'use strict';

/**
 * In this document Address assignement process is implementd:
 * This process assigns a new address for every user when a new month starts
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
const getYearMonth = require('../helpers/getYearMonth');
const createNewAddress = require('./createNewAddress');
const updateLastRun = require('../runs/update');
const notify = require('../slack/index');

// GLOBAL VARIABLES
let addressGen = null;
const hardCodedMonthlyLimit = 5000;

/**
 * Assign new address process
 * Starts the executeAddressAssign generator
 */
function assignNewAddress() {
    logger.info('Monthly address assignement: started');
    notify('Address assignement process starts');
    
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
        const activePledge = user.pledges.find(pledge => pledge.active);
        
        if (!activePledge) {
            let error = new Error('active-pledge-not-found');
            error.status = 404;
            error.details = `User with ID ${user._id} has no active pledge`;
            throw error;
        }
        if (typeof activePledge.addresses !== 'object') {
            let error = new Error('active-pledge-without-addresses');
            error.status = 422;
            error.details = `User with ID ${user._id} does not have an "addresses" object`;
            throw error;
        }
        
        // we check user doesn't have already an address for this month. If it exists, we skip the process
        let date = new Date();
        let thisMonth = getYearMonth(date);
        let existentAddress = activePledge.addresses[thisMonth];
        
        if (existentAddress) {
            logger.info(`Monthly address assignement: User ${user._id} already has an address.`);
            continue;
        }
        
        // We need to request a new address for active user pledge to start a new month
        const pledgeId = activePledge._id;
        const monthlyLimit = hardCodedMonthlyLimit;// before: activePledge.monthlyLimit;
        let newAddress = yield createNewAddress(user._id, pledgeId, monthlyLimit, addressGen);
        
        if (!newAddress) {
            let error = new Error('new-address-failed');
            error.status = 422;
            error.details = `Could not send AWS a request for new Address for user ${user._id}`;
            throw error;
        }
        
        logger.info('Monthly address assignement: Address created successfully.');
        } catch(error) {
            logger.error({ err: error });
        }
    }
    
    logger.info('Monthly address assignement: Finished');

    let query = {
        process: 'addressAssignment',
    };

    let newValue = {
        last: Date.now(),
    };

    updateLastRun(query, newValue);
    notify('Address assignement process ends');
}

module.exports = assignNewAddress;
