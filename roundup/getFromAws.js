/**
 * This process is in charge of retrieve information from AWS queue service, verify if this information
 * has not been tampered and save retrieve transactions on DB
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

const AWSQueue = require('../lib/awsQueue');
const getAddress = require('../addresses/read');
const verifySignature  = require('../helpers/verifyJwsSignature');
const updateTransaction  = require('../transactions/chain/update');
const updateAddress  = require('../addresses/update');

const elliptic = require('elliptic');
const ed25519 = new elliptic.ec('ed25519');

function get() {
    const params = { queue: process.env.AWS_SQS_URL_FROM_SIGNER };

    return AWSQueue.receiveMessage(params)
        .then(handleResponseFromAws);
}

/**
 * When we have no more messages to process, tell the main process there is no more to do. Doing this
 * we expect to receive a 'finish' message to exit Worker process.
 * If there is work to do, we call the extract method on every message received
 * @author Nando
 * @param   {Array}                messages An array of messages from AWS or [] if no more of those
 * @returns {promise || undefined}
 */
function handleResponseFromAws(messages) {

    if (messages && messages.length === 0) {
        process.send('no more on AWS');
        return;
    }

    return Promise.all(messages.map(extractTransactionChainFromMessage));
}

/**
 * We try to extract the message body where [[transactionChain]] resides and if we have a chain
 * we query Address collection in order to get a public key for verifying this chain signature
 * @author Nando
 * @param   {object}  message The content of AWS message
 * @returns {promise}
 */
function extractTransactionChainFromMessage(message) {
    let transactionChain = null;

    if (message.Body) {

        try {
            transactionChain = JSON.parse(message.Body);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    if (transactionChain ) {

        return getAddress(transactionChain.payload.address).then(function (addressArray) {
            let address   = addressArray[0];

            if (!address) {
                let error = new Error('We couldn\'t get the Address ' + transactionChain.payload.address);
                return Promise.reject(error);
            }

            return verifySign(address, transactionChain);
        });
    }

    let error = new Error('There is no a transaction chain in this message');
    return Promise.reject(error);
}

/**
 * We try to verify this [[transactionChain]] is ours, if not, we reject
 * @author Nando
 * @param   {object}  address          has address of NPO and it's public key
 * @param   {object}  transactionChain An object of type [[Transaction]]
 * @returns {promise}
 */
function verifySign(address, transactionChain) {
    let publicKey = address.keys.public;

    return verifySignature(transactionChain, ed25519, publicKey).then(function (verified) {

        if (!verified) {
            let error = new Error('Signature for AWS message is incorrect');
            
            return Promise.reject(error);
        }

        return checkTransactionPayload(address, transactionChain);
    });
}

/**
 * We traverse transactions Array and save everyone on [[Transactions]] collection in order to know
 * when something is not right. We want to save the latest transaction ID on Address collection, so
 * we can verify chain integrity and check this latest transaction signature so we know it's not been
 * tampered
 * @author Nando
 * @param   {object}  address          has NPO public key
 * @param   {object}  transactionChain chain which payload has all transactions
 * @returns {promise}
 */
function checkTransactionPayload(address, transactionChain) {
    let publicKey = address.keys.public;
    let chainPayload = transactionChain.payload;
    let comparison = chainPayload.previous.payload.count + chainPayload.transactions.length;
    let latestTransaction = null;

    chainPayload.transactons.forEach(function (transaction) {

        saveTransaction(transaction);

        if (transaction.payload.count === comparison) {
            latestTransaction = transaction;
        }
    });

    if (latestTransaction && latestTransaction.length === 1) {

        return verifySignature(latestTransaction[0], ed25519, publicKey).then(function (verifiedLatest) {

            if (verifiedLatest) {
                return updateAddressLatestTransaction(latestTransaction._id, address.address);
            }

            let error = new Error('Signature for last transaction is incorrect');
            return Promise.reject(error);
        });
    }

    return Promise.resolve();	// Simply here is not the lastest message sent to AWS
}

function saveTransaction(transaction) {
    const query = {
        'hash.value': transaction.hash.value,
    };
    
    const newValue = {
        $set: {
            signatures: transaction.signatures,
        },
    };
    
    return updateTransaction(query, newValue);
}

function updateAddressLatestTransaction(latestTransactionId, address) {
    const query = {
        address: address,
    };

    const newValue = {
        $set: {
            latestTransaction: latestTransactionId,
        },
    };

    return updateAddress(query, newValue);
}

const FromAws = {
    get: get,	
};

module.exports = FromAws;
