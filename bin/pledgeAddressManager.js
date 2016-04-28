/**
 * Middleware to request a new wallet address from the signer server
 */
'use strict';

const P = require('bluebird');
const url = require('url');
const crypto = require('crypto');
const elliptic = require('elliptic');
const httpRequest = require('request');
const User = require('../users/user');
const Address = require('../addresses/address');
const Transaction = require('../transactions/chain/transaction');
const ObjectId = require('mongoose').Types.ObjectId;
const amazonWebServicesQueue = require('../lib/awsQueue');
const stringify = require('json-stable-stringify');
const logger = require('../logger');

const schemes = {
  ed25519: new elliptic.ec('ed25519')
};

/**
 * Pledge Address Manager
 */
function PledgeAddressManager() {
    let envInterval = process.env.AWS_SQS_ADDRESS_REQUESTS_INTERVAL;
    this.interval = isNaN(envInterval) || envInterval < 1 ?
        10 : envInterval; // 1 minute minimum
    this.interval *= 1000; // convert seconds to miliseconds
    this.models = {
        user: User
    };
}

/**
 * Sets up the task to run every few minutes
 * @return {Object} - A setInterval object (for possible use with clearInterval)
 */
PledgeAddressManager.prototype.start = function () {
    let params = {
        queue: process.env.AWS_SQS_URL_ADDRESS_REQUESTS
    };
    let pollQueue = this.pollQueue.bind(this, amazonWebServicesQueue, params);
    return setInterval(pollQueue, this.interval);
};

/**
 * Recursively polls an Amazon Web Services Queue for available messages
 * @param {Object} queue - An Amazon Simple Queue Service queue
 * @param {Object} params - A set parameters for message queueing
 */
PledgeAddressManager.prototype.pollQueue = function (queue, params) {
    let available = 0;
    /* Check available messages before polling the queue */
    return queue.getQueueAttributes(params)
        .then(attributes => {
            available = attributes.ApproximateNumberOfMessages;
            /* Poll messages from the queue */
            return queue.receiveMessage(params);
        })
        .then(messages => {
            /* Parse messages and request a new pledge address when applicable */
            return this.parsePledgeAddressRequests(messages)
                .map(message => {
                    return this.handlePledgeAddressRequest(message, queue, params);
                }, {concurrency: 10})
                .then(() => messages);
        })
        .then(messages => {
            /* Poll the queue again if not all available messages were received */
            if (messages.length < available) {
                return this.pollQueue(queue, params);
            }
        });
};

/**
 * Parses and filters messages according to the expected properties
 * @param  {String[]} messages - An array of messages received from a queue
 * @return {String[]} A filtered array of valid parsed messages
 */
PledgeAddressManager.prototype.parsePledgeAddressRequests = function (messages) {
    /* Parse properly formatted JSON request messages */
    return P.map(messages, message => {
        let body;

        try {
            body = JSON.parse(message.Body);
        } catch (error) {
            logger.error(error);
            return error;
        }

        body.amazonWebServicesHandle = message.ReceiptHandle;
        return body;
    }).filter(message => {
        return message.userId && message.pledgeId && message.limit && message.nonce;
    });
};

PledgeAddressManager.prototype.handlePledgeAddressRequest = function (message, queue, queueParams) {
    return this.models.user.findOne({
        '_id': new ObjectId(message.userId),
        'pledges._id': new ObjectId(message.pledgeId)
    })
    .then(user => {
        if (!user) {
            return Promise.reject(new Error('user-not-found'));
        }
        return this.requestWalletAddress(user, message.pledgeId, message.nonce)
            .then(models => P.map(models, model => model.save()));
    })
    .then(() => {
        return queue.deleteMessage(
            message.amazonWebServicesHandle,
            queueParams
        );
    })
    .catch(error => {
        logger.error(error);
    });
};

PledgeAddressManager.prototype.requestWalletAddress = function (user, pledgeId, nonce) {
    let privateKey = process.env.SERVER_PRIVATE_KEY;
    let scheme = 'ed25519';
    let pledge = user.pledges.id(pledgeId);

    /* Build request body */
    let body = {
        hash: {
            type: 'sha256'
        },
        payload: {
            type: 'pledge-address',
            reference: pledge._id,
            limit: pledge.monthlyLimit,
            nonce: nonce
        },
        signatures: [{
            header: {
              alg: scheme,
              kid: process.env.SERVER_KID
            }
        }]
    };

    /* Generate a cryptographic hash of the payload */
    body.hash.value = crypto.createHash(body.hash.type)
        .update(stringify(body.payload)).digest('hex');

    /* Sign the hash of the payload */
    body.signatures[0].signature = schemes[scheme]
        .sign(body.hash.value, privateKey, 'hex').toDER('hex');

    let postUrl = url.resolve(process.env.SIGNER_URL, '/addresses');
    return this.makeHttpRequest('POST', postUrl, body)
        .then(data => {
            let transaction = new Transaction(data.statement);
            let address = new Address({
                address: data.address,
                keys: data.keys,
                latestTransaction: data.statement.hash.value
            });

            return P.all([transaction, address])
                .spread((transaction, address) => {
                    pledge.addresses.unshift(address.address);
                    return [
                        user,
                        transaction,
                        address
                    ];
                });
        });
};

PledgeAddressManager.prototype.makeHttpRequest = function makeHttpRequest(method, url, body, options) {
    options = options || {};

    return new Promise((resolve, reject) => {
        httpRequest({
            method: method,
            url: url,
            body: body,
            json: true,
            headers: options.headers
        }, (error, response) => {
            if (error) {
                return reject(error);
            }
            if (!response.body || typeof response.body.data !== 'object') {
                let err = new Error();
                err.status = 422;
                err.message = 'bad-response';
                return reject(err);
            }

            return resolve(response.body.data);
        });
    });
};

module.exports = new PledgeAddressManager();
