'use strict';

const getAddress = require('../addresses/read');

/**
 * Finds hash for [[latestTransaction]] on address collection in order to find the transaction later
 * @param {String}    address
 * @param {generator} generator
 */
function getLatestTransactionHash(address, generator) {
  const query = {
    address: address,
  };
  
  getAddress(query)
    .then(addressWithLatestTransaction => {
      
      if (!addressWithLatestTransaction) {
        let error = new Error('Address not found');
        generator.throw(error);
      }
      
      generator.next(addressWithLatestTransaction.latestTransaction);
    })
    .catch(generator.throw);
}

module.exports = getLatestTransactionHash;
