'use strict';

/**
 * Verifies integrity of every transaction componenet is to be trusted
 * @param {String}    address
 * @param {generator} generator
 */
function verifyData(address, generator) {
  // Implemented in https://github.com/ElmGives/elmgives-api/pull/42 but not merged yet
  generator.next(true);
}

module.exports = verifyData;
