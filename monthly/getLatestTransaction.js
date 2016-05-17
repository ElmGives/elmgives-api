'use strict';

const getTransaction = require('../transactions/read');

/**
 * We get a transaction from a hash
 * @param {String}    hash
 * @param {generator} generator
 */
function getLatestTransaction(hash, generator) {
  const query = {
    'hash.value': hash,
  };
  
  getTransaction(query)
    .then(transaction => {
      
      if (!transaction) {
        let error = new Error('Latest transaction not found');
        generator.throw(error);
      }
      
      generator.next(transaction);
    });
}

module.exports = getLatestTransaction;
