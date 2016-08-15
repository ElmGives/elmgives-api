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

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const logger = require('../logger');
const transactionChain = require('../helpers/transactionChain');
const getTransaction = require('../transactions/chain/read');
const createTransaction = require('../transactions/chain/create');
const getAddress = require('../addresses/read');
const AWSQueue = require('../lib/awsQueue');
const stringify = require('json-stable-stringify');
const checkMonthlyLimit = require('../helpers/checkMonthlyLimit');
const filterMapOrder = require('../helpers/filterMapOrderPlaidTransactions');
const request = require('request');
const moment = require('moment');
const P = require('bluebird');

const elliptic = require('elliptic');
const ed25519 = new elliptic.ec('ed25519');

const options = {
    host: process.env.PLAID_ENV.replace('https://', ''),
    method: 'POST',
    path: '/connect/get',
    json: true,
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * We query Plaid services for user transaction history
 * @param   {object}    personData
 */
function requestPlaidTransactions(personData, dateOptions) {
    dateOptions = typeof dateOptions === 'object' ? dateOptions : {};

    let gteDate;
    if (dateOptions.month) {
        gteDate = moment.format('YYYY-MM-01');
    } else {
        let numberOfDays = typeof dateOptions.days === 'number' ? parseInt(dateOptions.days) : 1;
        gteDate = dateOptions.gte || moment().subtract(numberOfDays, 'days').format('YYYY-MM-DD');
    }

    const postData = {
        'client_id': process.env.PLAID_CLIENTID,
        'secret': process.env.PLAID_SECRET,
        'access_token': personData.token,
        'options': {
            gte: gteDate,
            lte: dateOptions.lte
        }
    };

    logger.info('Round up process: Request plaid information');

    let plaidRequestParams = Object.assign({}, options);
    plaidRequestParams.url = process.env.PLAID_ENV + options.path;
    plaidRequestParams.body = postData;

    return new P((resolve, reject) => {
        request(plaidRequestParams, (err, res, body) => {
            if (err) {return reject(err);}

            return processData(body, personData)
                .then(resolve).catch(reject);
        });
    });
}

/**
 * We take the transactions array from plaid and filter out those that we don't need and that are not pending.
 * On the remaining data, we round up and save this new transaction
 * With all analized transactions we sign them and send them to AWS queue for later retrieval
 * @param {object} data         The response from Plaid
 * @param {string} personData User ID
 */
function processData(data, personData) {

    let plaidTransactions = null;

    try {
        plaidTransactions = filterMapOrder(data.transactions, personData);
    }
    catch (error) {
        return Promise.reject(error);
    }

    if (plaidTransactions && plaidTransactions.length) {
        
        logger.info('Round up process: plaid transactions found, rounded up and saved on DB.');

        return getPreviousChain(personData)
            .then(checkMonthlyLimit.bind(null, personData, plaidTransactions))
            .then(params => {
                
                // NOTE: Use destructuring when available
                let previousChain = params[0];
                let checkedPlaidTransactions = params[1];

                // If the user has reached his/her monthly limit, we just skip the rest of this process
                if (checkedPlaidTransactions.length === 0) {
                    return Promise.resolve();
                }

                return Promise
                    .all([
                        previousChain,
                        personData.address,
                        transactionChain.create(personData.address, previousChain, checkedPlaidTransactions),
                    ])
                    .then(saveTransactions)
                    .then(sign)
                    .then(sendToQueue)
                    .then(sendPostToAws);
            });
    } else {
        logger.info('No plaid transactions found');
        return Promise.resolve();
    }
}

/**
 * Get previous transaction on transaction chain
 * @param   {object}               personData person information
 * @returns {promise<object|null>} Previous transaction object
 */
function getPreviousChain(personData) {
    
    return getAddress({ address: personData.address })
        .then(address => {
    
            if (!address || address.length === 0) {
                let error = new Error('There is no address to get the previous transaction');
                return Promise.reject(error);
            }

            logger.info('Round up process: got address for latestTransaction.');
            
            return getTransaction({ 'hash.value': address.latestTransaction});
        });
}

/**
 * Sends signed transactions to AWS queue
 * @param   {Array}   transactionChain Signed transactions array
 * @returns {promise}
 */
function sendToQueue(transactionChain) {
    const params = { queue: process.env.AWS_SQS_URL_TO_SIGNER };

    logger.info('Round up process: sending transactionChain to AWS queue...');
    
    return AWSQueue.sendMessage(transactionChain, params);
}

/**
 * We send a triggger to AWS for signing to be done on signing server
 * @returns {promise}
 */
function sendPostToAws() {
    let awsUrl = url.parse(process.env.SIGNER_URL);
    
    const options = {
        host: awsUrl.hostname,
        port: awsUrl.port,
        path: '/aws/sqs',
        method: 'POST',
    };
    
    return new Promise(function (resolve, reject) {
        
        let request = http.request(options, function (response) {
            response.setEncoding('utf8');
            
            response.on('data', function (chunk) {
                logger.info('Round up process: triggered signing server');
            });
            
            response.on('error', reject);
            response.on('end', resolve);
        });
        
        request.end();
    });
}
    
/**
 * Creates a new transaction based on what was created on transaction chain.
 * We save this in order to verify transactions in case there is something wrong with
 * address server
 * @param   {Array} params  It has the previousChain, the address and the chain that we need to save
 * @returns {Array}         We just pass the array to the next function
 */
function saveTransactions(params) {
    // TODO: when nodejs implement destructuring, change params por [previousChain, address, chain]
    // let previousChain = params[0];
    // let address = params[1];
    let chain = params[2];
    
    chain.forEach(transaction => createTransaction (transaction));
    
    return Promise.resolve(params);
}

/**
 * We create an object for signing ready for AWS to enqueue
 * @author Nando
 * @param   {Array}           params What comes from transaction chain creation
 * @returns {Promise<object>} Signature request object
 */
function sign(params) {
    // TODO: when nodejs implement destructuring, change params por [previousChain, address, chain]
    let previousChain = params[0];
    let address = params[1];
    let chain = params[2];

    let signatureRequestMessage = {
        hash: {
            type: 'sha256',
        },
        payload: {
            address: address,
            previous: {
                hash: previousChain.hash,
                payload: previousChain.payload,
                signatures: previousChain.signatures,
            },
            transactions: chain,
        },
        signatures: [],
    };

    signatureRequestMessage.hash.value = crypto.createHash('sha256')
        .update(stringify(signatureRequestMessage.payload)).digest('hex');

    // If there is no signature, then we can't continue
    // TODO: Add more checks. Signature process is very picky
    let signature = ed25519.sign(signatureRequestMessage.hash.value, process.env.SERVER_PRIVATE_KEY, 'hex').toDER('hex');

    if (!signature) {
        let error = new Error('Invalid signature');
        return Promise.reject(error);
    }

    signatureRequestMessage.signatures.push({
        header: {
            alg: 'ed25519',
            kid: process.env.SERVER_KID,
        },
        signature: signature,
    });
    
    logger.info('Round up process: transactionChain created');

    return Promise.resolve(signatureRequestMessage);
}

let RoundAndSend = {
    request: requestPlaidTransactions,
};

module.exports = RoundAndSend;
