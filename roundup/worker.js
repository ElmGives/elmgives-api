/**
 * Queries PLAID servers for user account information in order to round up the sum to donate to NOPs
 */

'use strict';

const roundAndSendToAmazon  = require('./roundAndSendToAwsQueue');
const fromAws               = require('./getFromAws');
const logger                = require('../logger');

const Worker = {

    /**
     * Add eventListener to supervisor in order to request information to Plaid with userData sent by
     * supervisor
     */
    init() {
        process.on('message', this.askForWork.bind(this));

        // Tell main process I'm ready to work
        process.send('ready');
    },

    /**
     * If I receive a 'finish' String, it's time to exist. Otherwise I received a person and I have to analize it
     * @param {string|object} msg 'finish' or an object with '_id' and 'token' properties
     */
    askForWork(msg) {

        if (msg === 'finish') {
            process.exit(0);
            return;
        }

        if ( msg === 'get from AWS') {

            fromAws.get()
				.then( () => process.send('ready'))
                .catch( error => {
					logger.error({ err: error });

                    process.send('ready');
                });

            return;
        }

        roundAndSendToAmazon.request(msg);
    },
};

module.exports = Worker;
