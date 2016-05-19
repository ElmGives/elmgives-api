'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');

/**
 * Verifies integrity of every transaction componenet is to be trusted
 * @param {String}    address
 * @param {generator} generator
 */
function verifyData(address, generator) {
  
  getVerifiedAddressBalance(address)
    .then(generator.next)
    .catch(generator.throw);
}

module.exports = verifyData;
