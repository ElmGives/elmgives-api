/**
 * Creates a transaction chain using hash pointers
 */
'use strict';

const crypto = require('crypto');

const Transaction = require('../transactions/chain/transaction');

module.exports = function createTransactionChain(address, previous, transactions) {
  if (!validateTransactionProperties(previous)) {
    return Promise.reject({error: 'invalid-previous-transaction'});
  } else if (address !== previous.payload.address) {
    return Promise.reject({error: 'address-mismatch'});
  }

  let transactionChain = [];

  for (let i = 0, length = transactions.length; i < length; i++) {
    let transaction = transactions[i];
    previous = (i === 0) ? previous : transactionChain[i - 1];
    let newBalance = (parseFloat(previous.payload.balance) - transaction.roundup).toFixed(2);
    let previousHash = (i === 0) ? previous.hash.value : transactionChain[i - 1].hash.value;

    let data = {
      hash: {
        type: previous.hash.type
      },
      payload: {
        count: previous.payload.count + 1,
        address: previous.payload.address,
        amount: transaction.amount.toFixed(2),
        roundup: transaction.roundup.toFixed(2),
        balance: newBalance,
        currency: previous.payload.currency, 
        limit: previous.payload.limit,
        previous: previousHash,
        timestamp: transaction.date,
        reference: transaction.transactionId,
        info: transaction.name
      },
      signatures: []
    };

    let json = JSON.stringify(data.payload);
    data.hash.value = crypto.createHash(data.hash.type).update(json).digest('hex');
    let newTransaction = new Transaction(data);

    if (newTransaction.validateSync()) {
      return Promise.reject({error: 'invalid-transaction-record', message: transactions[i]});
    }

    transactionChain.push(newTransaction);
  }

  return Promise.all(transactionChain.map(tx => tx.save(tx => tx)));
};

function validateTransactionProperties(transaction) {
  let validationError = transaction.validateSync();
  if (validationError) {
    return false;
  }

  /* Hash validation */
  let digest;
  try {
    let json = JSON.stringify(transaction.payload);
    digest = crypto.createHash(transaction.hash.type).update(json).digest('hex');
  } catch (e) {
    throw e;
  } finally {
    if (transaction.hash.value !== digest) {
      return false;
    }
  }

  return true;
}