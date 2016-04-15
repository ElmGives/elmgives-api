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

const logger                  = require('../logger');
const AWSQueue                = require('../lib/awsQueue');
const getAddress              = require('../addresses/read');
const verifySignature         = require('../helpers/verifyJwsSignature');
const saveTransaction         = require('../transactions/chain/create');
const updateAddress           = require('../addresses/update');

const elliptic = require('elliptic');
const ed25519  = new elliptic.ec('25519');

const FromAws = {

	get() {
        const params = { queue: process.env.AWS_SQS_URL_FROM_SIGNER };

        return AWSQueue.receiveMessage(params)
            .then(this.handleResponseFromAws.bind(this))
            .catch(logger.error);
    },

    handleResponseFromAws(messages) {

        // When there is no more messages, Amazon sends us an empty Array
        if (messages && messages.length === 0) {
            process.send('ready');
            return;
        }

        return Promise.all(messages.map(this.extractTransactionChainFromMessage.bind(this)));
    },

    extractTransactionChainFromMessage(message) {
        let transactionChain = null;

        if (message.Body) {

            try {
                transactionChain = JSON.parse(message.Body);
            }
            catch (error) {
                logger.error({ err: error });
            }
        }

        if (transactionChain ) {

            return getAddress(transactionChain.payload.address).then(function (addressArray) {
                let address   = addressArray[0];

                if (!address) {
                    return Promise.resolve();
                }

                return this.verifySign(address, transactionChain);
            }.bind(this)).catch(logger.error);
        }
    },

    verifySign(address, transactionChain) {
        let publicKey = address.keys.public;

        return verifySignature(transactionChain, ed25519, publicKey).then(function (verified) {

            if (!verified) {
                return Promise.resolve();
            }

            let latestTransaction = null;
            transactionChain.transactions.forEach( transaction => {

                this.saveTransaction(transaction);

                if (latestTransaction) {

                    if (latestTransaction.payload.timestamp < transaction.payload.timestamp) {
                        latestTransaction = transaction;
                    }
                }
                else {
                    latestTransaction = transaction;
                }
            });

            if (latestTransaction) {
                return this.updateAddressLatestTransaction(latestTransaction._id, address.address);
            }

            return Promise.resolve();
        }.bind(this)).catch(logger.error);
    },

    saveTransaction(transaction) {
        return saveTransaction(transaction);
    },

    updateAddressLatestTransaction(latestTransactionId, address) {
        const query = {
            address: address,
        };

        const newVal = {
            $set: {
                latestTransaction: latestTransactionId,
            },
        };

        return updateAddress(query, newVal);
    },
};

module.exports = FromAws;
