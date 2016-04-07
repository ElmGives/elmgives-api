/**
 * Queries PLAID servers for user account information in order to round up the sum to donate to NOPs
 */

'use strict';

const querystring       = require('querystring');
const https             = require('https');
const logger            = require('../logger');
const create            = require('../transactions/create');
const padNumber         = require('../helpers/padNumber');
const roundup           = require('../helpers/roundup');
const transactionFilter = require('../helpers/plaidTransactionFilter');

const PLAID_SERVER = process.env.PLAID_ENV || 'tartan.plaid.com';

const yesterdate  = new Date(Date.now() - (1000 * 60 * 60 * 24));
const YESTERDAY   = `${yesterdate.getFullYear()}-${padNumber(yesterdate.getMonth() + 1)}-${padNumber(yesterdate.getDate())}`;

const options = {
    host   : PLAID_SERVER,
    method : 'POST',
    path   : '/connect/get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

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

        this.request(msg);
    },

    /**
     * Sends an https request to plaid requesting user history data
     * @param {object} personData Its needed personID, along with person plaid access token
     */
    request(personData) {

        const postData = querystring.stringify({
            'client_id'   : process.env.PLAID_CLIENTID || 'test_id',
            'secret'      : process.env.PLAID_SECRET || 'test_secret',
            'access_token': personData.token,
            'options'     : {
              'gte':  YESTERDAY,
            }
        });

        let req = https.request(options, this.requestHandler.bind(this, personData._id));

        req.on('error', logger.error);
        req.write(postData);
        req.end();
    },

    requestHandler(personDataId, res) {
        res.setEncoding('utf8');

        this.result = '';

        res.on('data', chunk => this.result += chunk);

        res.on('end', () => {

            if (res.statusCode !== 200) {
                logger.error({ err: this.result }, 'There was an error with the https request');
                this.result = '';
                return;
            }
            this.processData(this.result, personDataId);

            this.result = '';

            // We tell main process we are ready for more work
            process.send('ready');
        });
    },

    /**
     * We take the transactions array from plaid and filter out those that we don't need and that are not pending.
     * On the remaining data, we round up and save this new transaction
     * @param {object} data         The response from Plaid
     * @param {string} personDataId User ID
     */
    processData(data, personDataId) {

        try {

            JSON.parse(data).transactions
                .filter(transactionFilter)
                .forEach(this.roundUpAndSave.bind(this, personDataId));
        }
        catch (error) {
            logger.error({ err: error });
        }
    },

    /**
     * Takes a transaction, rounds up the amount and save this as a plaidTransaction for later processing
     * @param {string} personDataId
     * @param {object} transaction
     */
    roundUpAndSave(personDataId, transaction) {
        let roundupValue = roundup(transaction.amount);

        let plaidTransaction = {
            userId       : personDataId,
            transactionId: transaction._id,
            amount       : transaction.amount,
            date         : transaction.date,
            name         : transaction.name,
            roundup      : roundupValue,
            summed       : false,    // This one is to know if we have already ran the process on this transaction
        };

        this.save(plaidTransaction);
    },

    /**
     * We pass transaction to be saved on DB
     * @param {object} transaction
     */
    save(transaction) {
       create(transaction);
    },
};

module.exports = Worker;
