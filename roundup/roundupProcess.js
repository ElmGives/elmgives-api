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
const getYearMonth = require('../helpers/getYearMonth');

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
            $exists: true,
        },
        'plaid.accounts': {
            $exists: true,
            $ne: {},
        },
        'plaid.tokens.connect': {
            $exists: true,
            $ne: {},
        },
        pledges: {
            $exists: true,
        },
        'pledges.addresses': {
            $exists: true,
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
                logger.info('There is no people information to process');
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
    const activePledge = person.pledges.filter(pledge => pledge.active);
    
    if (activePledge.length === 0) {
        const error = new Error(`User with ID ${person._id} has not an active pledge`);

        logger.error({ err: error });
        return;
    }
    
    const thisMonth = getYearMonth(new Date());
    const address = activePledge[0].addresses[thisMonth];
    
    if (!address) {
        const error = new Error('address-not-found');
        error.status = 422;
        error.description = `User ${person._id} doesn't have an address for this month`;

        logger.error({ err: error });
        return;
    }

    // NOTE: We assume user has only one bank account registered on the application for pledge
    const query = {
        _id: activePledge[0].bankId,
    };
    
    findOneBank(query).then(bank => {
    
        if (!bank) {
            const error = new Error('There is no bank on banks collection with this ID: ' + query._id);
            logger.error({
                err: error
            });

            return;
        }
        
        const accountId = person.plaid.accounts[bank.type].id;
        const plaidToken = person.plaid.tokens.connect[bank.type];
        const monthlyLimit = activePledge[0].monthlyLimit;
        
        let options = {
            _id: person._id,
            plaidAccountId: accountId,
            token: plaidToken,
            address: address,
            limit: monthlyLimit,
        };
        
        roundAndSendToAmazon.request(options);
    });
}

const RoundupProcess = {
    run: run,
};

module.exports = RoundupProcess;
