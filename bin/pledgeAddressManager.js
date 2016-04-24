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

const schemes = {
  ed25519: new elliptic.ec('ed25519')
};

module.exports = {
    start: startPledgeAddressManager,
    requestAddress: requestWalletAddress
};

/**
 * Sets up the task to run every few minutes
 * @return {Object} - A setInterval object (for possible use with clearInterval)
 */
function startPledgeAddressManager() {
    let envInterval = process.env.AWS_SQS_ADDRESS_REQUESTS_INTERVAL;
    let interval = isNaN(envInterval) || envInterval < 1 ?
        10 : envInterval; // 1 minute minimum
    interval *= 1000; // convert seconds to miliseconds
    return setInterval(pollAwsQueueForMessages, interval);
}

/**
 * Recursively polls an Amazon Web Services Queue for available messages
 */
function pollAwsQueueForMessages() {
    let params = {
        queue: process.env.AWS_SQS_URL_ADDRESS_REQUESTS
    };

    (function checkAndRequestMessages() {
        let available = 0;
        amazonWebServicesQueue.getQueueAttributes(params)
            .then(attributes => {
                available = attributes.ApproximateNumberOfMessages;
                return amazonWebServicesQueue.receiveMessage(params);
            })
            .then(messages => {
                return parsePledgeAddressRequests(messages)
                    .map(message => {
                        return User.findOne({
                            '_id': new ObjectId(message.userId),
                            'pledges._id': new ObjectId(message.pledgeId)
                        })
                        .then(user => requestWalletAddress(user, message.pledgeId, message.nonce))
                        .then(() => {
                            return amazonWebServicesQueue.deleteMessage(
                                message.amazonWebServicesHandle,
                                params
                            );
                        });
                    }, {concurrency: 10})
                    .then(() => {
                        if (messages.length < available) {
                            return checkAndRequestMessages();
                        }
                    });
            });
    })();
}

function parsePledgeAddressRequests(messages) {
    /* Parse properly formatted JSON request messages */
    return P.map(messages, message => {
        let body;

        try {
            body = JSON.parse(message.Body);
        } catch (e) {
            return {};
        }

        body.amazonWebServicesHandle = message.ReceiptHandle;
        return body;
    }).filter(message => {
        return message.userId && message.pledgeId && message.limit && message.nonce;
    });
}

function requestWalletAddress(user, pledgeId, nonce) {
    if (!user) {
        return Promise.reject(new Error('user-not-found'));
    }

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
        .update(JSON.stringify(body.payload)).digest('hex');

    /* Sign the hash of the payload */
    body.signatures[0].signature = schemes[scheme]
        .sign(body.hash.value, privateKey, 'hex').toDER('hex');

    let postUrl = url.resolve(process.env.SIGNER_URL, '/addresses');
    return requestWalletAddress.makeHttpRequest('POST', postUrl, body)
        .then(data => {
            return Transaction.create(data.statement)
                .then(transaction => {
                    let newAddress = {
                        address: data.address,
                        keys: data.keys,
                        latestTransaction: transaction.hash.value
                    };
                    return Address.create(newAddress);
                })
                .then(address => {
                    pledge.addresses.unshift(address.address);
                    return user.save();
                });
        });
}

requestWalletAddress.makeHttpRequest = function makeHttpRequest(method, url, body, options) {
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
