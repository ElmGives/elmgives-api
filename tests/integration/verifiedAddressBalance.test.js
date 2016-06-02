'use strict';

require('dotenv').config();
require('../../../config/database');

const tape = require('tape');
const verifiedAddressBalance = require('../../../helpers/verifiedAddressBalance');

const Address = require('../../../addresses/address');
const addresses = require('../../../db/addresses.json');
const Transaction = require('../../../transactions/chain/transaction');
const transactions = require('../../../db/transactions.json');

/* LATEST TRANSACTION */
let latestTransaction;
let latestTransactionHash = '5b199cd73aa2913146c3557533d05065cc01ef4a5dd3ecbb3cfe478d43cd50eb';
let latestTransactionBalance = -4.17;

let address = new Address({
    address: 'wiBUPYaaaF3QYhvWmu1bgjJavpuvhSfYmU',
    keys : {
        scheme: 'ed25519',
        public: '04574389f07ff8d7f9f7a6b32ab5d0c401ef01663b289e51d90ce025fcbc6f66a770db4c6e220feb05e32fb95e0c9342f97b8bb1eb68a6e621d5b49cb5ccbbc281'
    },
    latestTransaction: latestTransactionHash
});

let anotherHash = 'a062fd9a55fe2309273ec9cab5d1688b75bfaedc224c52de333c511d70f1b3f4';
let anotherSignature = '304402200fda2a9da2aee9ee3d2632e75b655630143e528fc8fb8b74819c1591125a480b022006657b0a2558cc1c6f45e36f7ae14107023655824734cd1024538ef0a4562405';
let anotherPublicKey = '0472d5b3b79b1cba96a05e587ce18245a1443ed53a8469e453995aad4749f25e0429de377db2c7f35740e4b296e80baccee42a04b61ec34bd37a44e7a6c57f34c6';
let existingAddressWithNoTransactions = 'wWUqEgRQv2412JDzczWJuc7t34CA2zdEeV';
let unexistingAddress = 'waUyYvWqvt1U1zGLU2JK5pyLmX1jUbzBqY';

tape('Verified Address Balance', test => {
    test.plan(9);

    Promise.resolve().then(() => {
        return Promise.all(transactions.map(transactionData => {
            return Transaction.findOne({'hash.value': transactionData.hash.value})
                .then(transaction => transaction ? transaction : (new Transaction(transactionData)).save())  ;          
        }))
        .then(transactions => {
            return transactions.find(transaction => {
                return transaction.hash.value === latestTransactionHash;
            });
        })
        .then(_transaction => latestTransaction = _transaction);
    })
    .then(() => {
        return Promise.all(addresses.map(addressData => {
            return Address.findOne({address: address.address})
                .then(address => address ? address : (new Address(addressData)).save());
        }))
        .then(addresses => {
            return addresses.find(_address => {
                return _address.address === address.address;
            });
        })
        .then(_address => address = _address);
    })
    .then(() => {
        return verifiedAddressBalance(address.address)
            .then(verifiedAddress => {
                test.equal(verifiedAddress.address, address.address,
                    `verified address balance is ${address.address}`);
                test.equal(verifiedAddress.balance, latestTransactionBalance,
                    `verified address balance is ${latestTransactionBalance}`);
            });
    })
    .then(() => {
        return verifiedAddressBalance(unexistingAddress)
            .then(() => test.fail('did not fail on address not found'))
            .catch(error => {
                test.equal(error.message, 'address-not-found', 'fails on address not found');
            });
    })
    .then(() => {
        return verifiedAddressBalance(existingAddressWithNoTransactions)
            .then(() => test.fail('did not fail on latest transaction not found'))
            .catch(error => {
                test.equal(error.message, 'latest-transaction-not-found', 'fails on latest transaction not found');
            });
    })
    .then(() => {
        test.equal(latestTransaction.hash.value, latestTransactionHash, 
            `latest transaction hash is ${latestTransactionHash}`);

        let formerHash = latestTransaction.hash.value;
        latestTransaction.hash.value = anotherHash;

        return latestTransaction.save().then(() => {
                return verifiedAddressBalance(address.address);
            })
            .then(() => test.fail('did not fail on latest transaction mismatch'))
            .catch(error => {
                test.equal(error.message, 'latest-transaction-mismatch', 'fails on latest transaction mismatch');
                latestTransaction.hash.value = formerHash;
                return latestTransaction.save();
            });
    })
    .then(() => {
        let formerPublicKey = address.keys.public;
        address.keys.public = anotherPublicKey;

        return address.save().then(() => {
                return verifiedAddressBalance(address.address);
            })
            .then(() => test.fail('did not fail on derived address mismatch'))
            .catch(error => {
                test.equal(error.message, 'derived-address-mismatch', 'fails on derived address mismatch');
                address.keys.public = formerPublicKey;
                return address.save();
            });
    })
    .then(() => {
        let formerSignature = latestTransaction.signatures;
        latestTransaction.signatures = [{
            header: formerSignature.header,
            signature: anotherSignature
        }];

        return latestTransaction.save().then(() => {
                return verifiedAddressBalance(address.address);
            })
            .then(() => test.fail('did not fail on invalid transaction signature'))
            .catch(error => {
                test.equal(error.message, 'invalid-transaction-signature', 'fails on invalid transaction signature');
                latestTransaction.signatures = formerSignature;
                return latestTransaction.save();
            });
    })
    .then(() => {
        let formerSignature = latestTransaction.signatures;
        latestTransaction.signatures = [{
            header: formerSignature.header,
            signature: 'invalid-signature-format'
        }];

        return latestTransaction.save().then(() => {
                return verifiedAddressBalance(address.address);
            })
            .then(() => test.fail('did not fail on invalid signature format'))
            .catch(error => {
                test.equal(error.message, 'invalid-transaction-signature', 'fails on invalid signature format');
                latestTransaction.signatures = formerSignature;
                return latestTransaction.save();
            });
    })
    .catch(error => test.fail(error));
});
