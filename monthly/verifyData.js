'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');

/**
 * Verifies integrity of every transaction componenet is to be trusted
 * @param {String}    address
 * @param {generator} generator
 */
function verifyData(address, generator) {
  
  getVerifiedAddressBalance(address)
    .then(information => generator.next(information))
    .catch(error => generator.throw(error));
}

module.exports = verifyData;
