/*
 * Retrieve and verify the latest balance of a wallet address
 */
'use strict';

const Address = require('../addresses/address');
const Transaction = require('../transactions/chain/transaction');
const deriveWalletAddress = require('./deriveWalletAddress');
const verifyJwsSignature = require('./verifyJwsSignature');

module.exports = function getVerifiedAddressBalance(address) {
    let addressDocument;
    let latestTransaction;

    return Address.findOne({
        address: address
    })
    .then(address => {
        addressDocument = address;
        if (!addressDocument) {
            let error = new Error();
            error.status = 404;
            error.message = 'address-not-found';
            return Promise.reject(error);
        }
        return addressDocument.address;
    })
    .then(address => {
        return Transaction.find({
            'payload.address': address
        }, null, {
            limit: 1,
            sort: {
                'payload.timestamp': -1,
                'createdAt': -1
            }
        })
        .then(transactions => transactions[0]);
    })
    .then(_latestTransaction => {
        latestTransaction = _latestTransaction;
        if (!latestTransaction) {
            let error = new Error();
            error.status = 422;
            error.message = 'latest-transaction-not-found';
            return Promise.reject(error);
        }
        if (latestTransaction.hash.value !== addressDocument.latestTransaction) {
            let error = new Error();
            error.status = 422;
            error.message = 'latest-transaction-mismatch';
            return Promise.reject(error);
        }

        return deriveWalletAddress(addressDocument.keys.public);
    })
    .then(derivedAddress => {
        if (derivedAddress !== addressDocument.address) {
            let error = new Error();
            error.status = 422;
            error.message = 'derived-address-mismatch';
            error.details = `Expected ${addressDocument.address} but got ${derivedAddress}`;
            return Promise.reject(error);
        }
        return verifyJwsSignature(latestTransaction, null, addressDocument.keys.public);
    })
    .then(validSignature => {
        if (!validSignature) {
            let error = new Error();
            error.status = 422;
            error.message = 'invalid-transaction-signature';
            return Promise.reject(error);
        }

        return {
            address: latestTransaction.payload.address,
            balance: latestTransaction.payload.balance,
            currency: latestTransaction.payload.currency
        };
    });
};
