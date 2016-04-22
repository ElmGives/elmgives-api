/**
 * Middleware to request a new wallet address from the signer server
 */
'use strict';

const url = require('url');
const uid2 = require('uid2');
const crypto = require('crypto');
const elliptic = require('elliptic');
const httpRequest = require('request');
const Transaction = require('../transactions/chain/transaction');
const Address = require('../addresses/address');

const schemes = {
  ed25519: new elliptic.ec('ed25519')
};

function requestWalletAddress(request, response, next) {
    let user = request.currentUser;
    let pledgeId = request.pledgeId;
    let pledge = user.pledges[0];
    let privateKey = process.env.SERVER_PRIVATE_KEY;
    let scheme = 'ed25519';
    let nonce = uid2(10);

    /* Build request body */
    let body = {
        hash: {
            type: 'sha256'
        },
        payload: {
            type: 'pledge-address',
            reference: String(pledgeId),
            limit: pledge.montlyLimit,
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
                    console.log(transaction);
                    let newAddress = {
                        address: data.address,
                        keys: data.keys,
                        latestTransaction: transaction.hash.value
                    };
                    return Address.create(newAddress);
                })
                .then(address => {
                    console.log(address);
                    pledge.addresses.unshift(address.address);
                    return user.save();
                });
        });
};

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
}

module.exports = requestWalletAddress;
