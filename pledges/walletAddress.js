/**
 * Middleware to request a new wallet address from the signer server
 */
'use strict';

const url = require('url');
const uid2 = require('uid2');
const crypto = require('crypto');
const elliptic = require('elliptic');
const httpRequest = require('request');
const joi = require('joi');
const TransactionJoi = require('../joi/transaction');
const Transaction = require('../transactions/chain/transaction');
const Address = require('../addresses/address');

const schemes = {
  ed25519: new elliptic.ec('ed25519')
};

module.exports = function requestWalletAddress(request, response, next) {
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

    return new Promise((resolve, reject) => {
        httpRequest.post({
            url: postUrl,
            body: body,
            json: true
        }, (error, res) => {
            if (error) {
                // PENDING: trigger error
                return;
            }
            if (!res.body || !res.body.data) {
                let err = new Error();
                err.status = 422;
                err.message = 'Empty response';
                // PENDING: trigger error
                return;
            }

            let data = res.body.data;
            joi.validate(data.statement, TransactionJoi, (error, statement) => {
                if (error) {
                    // PENDING: trigger error
                    return;
                }

                pledge.addresses.unshift(statement.payload.address);

                return user.save()
                    .then(() => {
                        return Transaction.create(statement);
                    })
                    .then(transaction => {
                        let newAddress = {
                            address: data.address,
                            keys: data.keys,
                            latestTransaction: statement.hash.value
                        };
                        return Address.create(newAddress);
                    })
                    .catch(error => {
                        // PENDING: trigger error
                    });
            });
        });
    });
};
