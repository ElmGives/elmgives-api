/**
 * This process is in charge of query plaid service, round up every transaction received
 * and send the result to AWS queue service
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

const https                   = require('https');
const querystring             = require('querystring');
const crypto                  = require('crypto');
const logger                  = require('../logger');
const padNumber               = require('../helpers/padNumber');
const transactionFilter       = require('../helpers/plaidTransactionFilter');
const transactionChain        = require('../helpers/transactionChain');
const roundup                 = require('../helpers/roundup');
const createPlaidTransaction  = require('../transactions/create');
const getTransaction          = require('../transactions/chain/read');
const AWSQueue                = require('../lib/awsQueue');

const elliptic = require('elliptic');
const ed25519  = new elliptic.ec('ed25519');

const yesterdate  = new Date(Date.now() - (1000 * 60 * 60 * 24));
const YESTERDAY   = `${yesterdate.getFullYear()}-${padNumber(yesterdate.getMonth() + 1)}-${padNumber(yesterdate.getDate())}`;
const PLAID_SERVER = process.env.PLAID_ENV || 'tartan.plaid.com';

const options = {
    host   : PLAID_SERVER,
    method : 'POST',
    path   : '/connect/get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

let RoundAndSend = {

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

        let req = https.request(options, this.requestHandler.bind(this, personData));

        req.on('error', logger.error);
        req.write(postData);
        req.end();
    },

    requestHandler(personData, res) {
        res.setEncoding('utf8');

        this.result = '';

        res.on('data', chunk => this.result += chunk);

        res.on('end', () => {

            if (res.statusCode !== 200) {
                logger.error({ err: this.result }, 'There was an error with the https request');
                this.result = '';
                return;
            }

            this.processData(this.result, personData).then(() => {

                this.result = '';

                // We tell main process we are ready for more work
                process.send('ready');
            }).catch(logger.error);

        });
    },

    /**
     * We take the transactions array from plaid and filter out those that we don't need and that are not pending.
     * On the remaining data, we round up and save this new transaction
     * With all analized transactions we sign them and send them to AWS queue for later retrieval
     * @param {object} data         The response from Plaid
     * @param {string} personData User ID
     */
    processData(data, personData) {

		let plaidTransactions = null;

        try {

            plaidTransactions = JSON.parse(data).transactions
                .filter(transactionFilter)
                .map(this.roundUpAndSave.bind(this, personData));
        }
        catch (error) {
            logger.error({ err: error });
        }

		if (plaidTransactions) {

			return this.getPreviousChain(plaidTransactions)
                .then(previousChain => {
					return Promise.all([
						previousChain,
						personData.address,
						transactionChain.create(personData.address, previousChain, plaidTransactions),
					]);
				})
				.then(this.sign)
                .then(this.sendToQueue)
                .catch(logger.error);
		} else {
            return Promise.resolve();
        }
    },

    /**
     * Takes a transaction, rounds up the amount and save this as a plaidTransaction for later processing
     * @param {string} personData
     * @param {object} transaction
     */
    roundUpAndSave(personData, transaction) {
        let roundupValue = roundup(transaction.amount);

        let plaidTransaction = {
            userId       : personData._id,
            transactionId: transaction._id,
            amount       : transaction.amount,
            date         : transaction.date,
            name         : transaction.name,
            roundup      : roundupValue,
            summed       : false,    // This one is to know if we have already ran the process on this transaction
        };

        this.savePlaid(plaidTransaction, personData);

		return plaidTransaction;
    },

    /**
     * We pass transaction to be saved on DB
     * @param {object} plaidTransaction
     */
    savePlaid(plaidTransaction) {
       createPlaidTransaction(plaidTransaction);
    },

	/**
	 * Get previous transaction on transaction chain
	 * @param   {object}               personData person information
	 * @returns {promise<object|null>} Previous transaction object
	 */
	getPreviousChain(personData) {
		return getTransaction({ _id: personData.latestTransaction});
	},

	/**
	 * Sends signed transactions to AWS queue
	 * @param   {Array}   transactionChain Signed transactions array
	 * @returns {promise}
	 */
	sendToQueue(transactionChain) {
        const params = { queue: process.env.AWS_SQS_URL_TO_SIGNER };

		return AWSQueue.sendMessage(transactionChain, params);
	},

	/**
	 * We create an object for signing ready for AWS to enqueue
	 * @author Nando
	 * @param   {Array}           params What comes from transaction chain creation
	 * @returns {Promise<object>} Signature request object
	 */
	sign(params) {
        // TODO: when nodejs implement destructuring, change params por [previousChain, address, chain]
        let previousChain = params[0];
        let address       = params[1];
        let chain         = params[2];

        let signatureRequestMessage = {
            hash: {
                type: 'sha256',
            },
            payload: {
                address : address,
                previous: {
                    hash      : previousChain.hash,
                    payload   : previousChain.payload,
                    signatures: previousChain.signatures,
                },
                transactions: chain,
            },
            signatures: [],
        };

        signatureRequestMessage.hash.value = crypto.createHash('sha256')
            .update(JSON.stringify(signatureRequestMessage.payload)).digest('hex');

        // If there is no signature, then we can't continue
        // TODO: Add more checks. Signature process is very picky
        let signature = ed25519.sign(signatureRequestMessage.hash.value, process.env.SERVER_PRIVATE_KEY, 'hex').toDER('hex');

        if (!signature) { return Promise.reject('Invalid signature'); }

        signatureRequestMessage.signatures.push({
            header: {
                alg: 'ed25519',
                kid: process.env.SERVER_KID,
            },
            signature: signature,
        });

        return Promise.resolve(signatureRequestMessage);
	},
};

module.exports = RoundAndSend;
