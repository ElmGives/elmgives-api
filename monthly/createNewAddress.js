'use strict';

const aws = require('../lib/awsQueue');

/**
 * Address manager is in charge to add a new Address on Addresses collection and to update
 * User pledges address which is signaled with the sendMessage function
 * @param {String}    userId
 * @param {String}    pledgeId
 * @param {Number}    monthlyLimit
 * @param {generator} generator
 */
function createNewAddress(userId, pledgeId, monthlyLimit, generator) {
  
  aws.sendMessage({
    userId: userId,
    pledgeId: String(pledgeId),
    limit: monthlyLimit,
    nonce: String((new Date()).getTime())
  }, {
    queue: process.env.AWS_SQS_URL_ADDRESS_REQUESTS
  })
  .then(response => generator.next(response))
  .catch(error => generator.throw(error));
}

module.exports = createNewAddress;
