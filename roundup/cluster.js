/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
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

const cluster = require('cluster');
const User = require('../users/user');
const findOneBank = require('../banks/readOne');
const logger = require('../logger');

/**
 * Run [numberCpus] workers in order to process all work.
 * @param {number} numberCpus The number of workers this cluster can spawn
 */
function runWith(numberCpus) {

    const query = {
        active: true,
        plaid: { $exists: true },
        'plaid.tokens.connect': { $exists: true, $ne: {} },
        pledges: { $exists: true },
        'pledges.addresses': { $exists: true },
    };

    const selector = {
        _id: 1,
        plaid: 1,
        pledges: 1,
    };

    User.find(query, selector).then(people => {

        if (!people || people.length === 0) {
            logger.log('There is no people information to process');
            return;
        }

        for (let i = 0; i < numberCpus; i += 1) {
            let worker = cluster.fork();

            worker.on('message', assignWork.bind(null, worker, people));
            worker.on('exit',    exitIfNoMoreWorkersLeft);
        }
    }).catch(error => logger.error({ err: error }));
}

function exitIfNoMoreWorkersLeft() {

    // Active workers live on cluster.workers Array
    if (Object.keys(cluster.workers).length === 0) {
        process.exit(0);
    }
}

/**
 * When worker has no job, It sends a 'ready' message.
 * We check if there are more people to work on. If we do, we send one person to process
 * If we ran out of people, we send a message to worker to end its process
 * @param {object}        worker            A worker instance
 * @param {Array}         people
 * @param {string|Object} message           The message received from worker. From node v6+ this parameter
 *                                          corresponds to the Worker instance
 * @param {string|handle} possibleMessage   From node v6+ this will be the message
 */
function assignWork(worker, people, message, possibleMessage) {

    if (message === 'ready' || possibleMessage === 'ready') {
        const person = people.pop();

        if (person) {

            // NOTE: We assume user has only one bank account registered on the application for pledge
            const [ firstPledge ] = person.pledges;
            const [ firstAddress ] = firstPledge.addresses;
            
            const query = { _id: firstPledge.bandkId };

            findOneBank(query).then(bank => {

                if (!bank) {
                    const error = new Error('There is no bank on banks collection with this ID: ' + query._id);
                    logger.error({ err: error });
                    
                    assignWork(worker, people, 'ready');
                    return;
                }

                // we send just what the worker needs
                worker.send({
                    _id: person._id,
                    token: person.plaid.tokens.connect[bank.type],
                    address: firstAddress,
                });
            });

        } else {
            worker.send('get from AWS');
        }
    }

    if (message === 'no more on AWS' || possibleMessage === 'no more on AWS') {
        worker.send('finish');
    }
}

const Cluster = {
    runWith: runWith,
};

module.exports = Cluster;
