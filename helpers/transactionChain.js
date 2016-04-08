/**
 * Creates a transaction chain using hash pointers
 */
'use strict';

const crypto = require('crypto');
const P      = require('bluebird');

const Transaction = require('../transactions/chain/transaction');

module.exports = {
  create: createTransactionChain,
  createTransaction: createTransactionData
};

function createTransactionChain(address, previous, transactions) {
  if (address !== previous.payload.address) {
    return P.reject(new Error('address-mismatch'));
  }

  let transactionChain = [];

  return validatePreviousTransaction(previous)
  .then(() => P.each(transactions, function (transaction, index) {
    previous = (index === 0) ? previous : transactionChain[index - 1];
    let previousHash = (index === 0) ? previous.hash.value : transactionChain[index - 1].hash.value;

    let data = createTransactionData(transaction, previous, previousHash);

    let json = JSON.stringify(data.payload);
    data.hash.value = crypto.createHash(data.hash.type).update(json).digest('hex');
    let newTransaction = new Transaction(data);
    transactionChain.push(newTransaction);

    return new P((resolve, reject) => {
      newTransaction.validate(invalid => {
        return invalid ? reject(new Error('invalid-transaction-record')) : resolve();
      });
    });
  }))
  .then(() => transactionChain);
}

function createTransactionData(transaction, previous, previousHash) {
  let newBalance = (parseFloat(previous.payload.balance) - transaction.roundup).toFixed(2);

  return {
    hash: {
      type: previous.hash.type
    },
    payload: {
      count: previous.payload.count + 1,
      address: previous.payload.address,
      amount: parseFloat(transaction.amount.toFixed(2)),
      roundup: parseFloat(transaction.roundup.toFixed(2)),
      balance: parseFloat(newBalance),
      currency: previous.payload.currency,
      limit: previous.payload.limit,
      previous: previousHash,
      timestamp: transaction.date,
      reference: transaction.transactionId,
      info: transaction.name
    },
    signatures: []
  };
}

function validatePreviousTransaction(transaction) {
  return new P((resolve, reject) => {
    transaction.validate(invalid => {
      if (invalid) {return reject(new Error('invalid-previous-transaction'));}

      /* Hash validation */
      let digest;
      try {
        let json = JSON.stringify(transaction.payload);
        digest = crypto.createHash(transaction.hash.type).update(json).digest('hex');
      } catch (e) {
        return reject(e);
      } finally {
        if (transaction.hash.value !== digest) {
          return reject(new Error('previous-transaction-hash-mismatch'));
        }
      }

      return resolve(true);
    });
  });
}
