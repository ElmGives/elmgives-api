/**
 * Adds a new address for transaction verification (Not a middleware)
 */
'use strict';

const Address = require('./address');
const logger  = require('../logger');

module.exports = function createAddress(address) {

    if (!address) {
        return Promise.reject('Invalid Address');
    }

    return new Address(address)
        .save()
        .catch(logger.error);
};
