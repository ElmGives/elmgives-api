/**
 * Runs two processes:
 * - Round up and sent to AWS queue every transaction obtained from plaid service for every active user
 * - Get from AWS queue every signed transaction chain for those users and save those signed transacions for
 *   monthly stripe payment process
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

const User = require('../users/user');
const findOneBank = require('../banks/readOne');
const logger = require('../logger');

const roundAndSendToAmazon = require('./roundAndSendToAwsQueue');
const getFromAws = require('./getFromAws');

const ONE_MINUTE = 1000 * 60;

/**
 * Query User collection for people with plaid token and created pledge addresses
 * From every person, we extract what we need for round ups
 */
function run() {
    
    logger.info('Daily round up process started');

    const query = {
        active: true,
        plaid: {
            $exists: true
        },
        'plaid.tokens.connect': {
            $exists: true,
            $ne: {}
        },
        pledges: {
            $exists: true
        },
        'pledges.addresses': {
            $exists: true
        },
    };

    const selector = {
        _id: 1,
        plaid: 1,
        pledges: 1,
    };
    
    logger.info('Round up process: Querying User collection...');

    User.find(query, selector)
        .then(people => {

            if (!people || people.length === 0) {
                logger.log('There is no people information to process');
                return;
            }

            // Round up and send to AWS queue for every person
            people.map(extractInformationFromPerson);
            
            // Then extract from AWS queue transaction chain signed information for every person
            setTimeout(() => getFromAws.get({ firstRun: true }), ONE_MINUTE);
        })
        .catch(error => logger.error({
            err: error
        }));
}

/**
 * We extract from person the bankId from Banks collection, with it, we need the plaid.token for consulting
 * plaid services and the address to sign our plaid transacions. That's what we send to roundAndSendToAmazon()
 * @param   {object}    person
 */
function extractInformationFromPerson(person) {
    
    // NOTE: We assume user has only one bank account registered on the application for pledge
    const firstPledge = person.pledges[0];
    const firstAddress = firstPledge.addresses[0];

    const query = {
        _id: firstPledge.bankId
    };
    
    findOneBank(query).then(bank => {
    
        if (!bank) {
            const error = new Error('There is no bank on banks collection with this ID: ' + query._id);
            logger.error({
                err: error
            });

            return;
        }
        
        let options = {
            _id: person._id,
            token: person.plaid.tokens.connect[bank.type],
            address: firstAddress,
        };
        
        roundAndSendToAmazon.request(options);
    });
}

const RoundupProcess = {
    run: run,
};

module.exports = RoundupProcess;
