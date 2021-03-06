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
const P = require('bluebird');

const roundAndSendToAmazon = require('./roundAndSendToAwsQueue');
const getFromAws = require('./getFromAws');
const getYearMonth = require('../helpers/getYearMonth');

const ONE_MINUTE = 1000 * 60;
const PROMISE_CONCURRENCY = 10;

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
            
            // Then extract from AWS queue transaction chain signed information for every person
            setTimeout(() => getFromAws.get({ firstRun: true }), ONE_MINUTE);

            // Round up and send to AWS queue for every person
            return P.map(people, person => {
                return extractInformationFromPerson(person)
                    .catch(error => logger.error({err: error}));
            }, {concurrency: PROMISE_CONCURRENCY});
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
    const activePledge = person.pledges.find(pledge => pledge.active);

    if (!activePledge || !activePledge.addresses) {
        const error = new Error(`User with ID ${person._id} has no active pledge.`);

        logger.error({ err: error });
        return Promise.resolve();
    } else if (activePledge.paused) {
        logger.info(`User with ID ${person._id} has an active pledge but it is paused.`);
        return Promise.resolve();
    }
    
    const thisMonth = getYearMonth(new Date());
    const address = activePledge.addresses[thisMonth];
    
    if (!address) {
        const error = new Error('address-not-found');
        error.status = 422;
        error.description = `User ${person._id} does not have an address for this month`;

        logger.error({ err: error });
        return Promise.resolve();
    }

    // NOTE: We assume user has only one bank account registered on the application for pledge
    const query = {
        _id: activePledge.bankId,
    };
    
    return findOneBank(query).then(bank => {
    
        if (!bank) {
            const error = new Error('There is no bank on banks collection with this ID: ' + query._id);
            logger.error({
                err: error
            });

            return Promise.resolve();
        }
        
        const accountId = person.plaid.accounts[bank.type].id;
        const plaidToken = person.plaid.tokens.connect[bank.type];
        const monthlyLimit = activePledge.monthlyLimit;
        
        let options = {
            _id: person._id,
            plaidAccountId: accountId,
            token: plaidToken,
            address: address,
            limit: monthlyLimit,
        };
        
        return roundAndSendToAmazon.request(options);
    });
}

const RoundupProcess = {
    run: run,
};

module.exports = RoundupProcess;
