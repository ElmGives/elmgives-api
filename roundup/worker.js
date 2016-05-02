/**
 * Queries PLAID servers for user account information in order to round up the sum to donate to NOPs
 */

'use strict';

const roundAndSendToAmazon = require('./roundAndSendToAwsQueue');
const fromAws = require('./getFromAws');
const logger = require('../logger');

/**
 * Add eventListener to supervisor in order to request information to Plaid with userData sent by
 * supervisor
 */
function init() {
    process.on('message', askForWork);

    // Tell main process I'm ready to work
    process.send('ready');
}

/**
 * If I receive a 'finish' String, it's time to exist. Otherwise I received a person and I have to analize it
 * @param {string|object} message 'finish' or an object with '_id' and 'token' properties
 */
function askForWork(message) {

    if (message === 'finish') {
        process.exit(0);
        return;
    }

    if ( message === 'get from AWS') {

        fromAws.get()
            .then( () => process.send('ready'))
            .catch( error => {
                logger.error({ err: error });

                process.send('ready');
            });

        return;
    }

    roundAndSendToAmazon.request(message);
}

const Worker = {
    
    create() {
        return {
            init: init,
        };
    },
};

module.exports = Worker;
