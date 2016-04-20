/**
 *
 */
'use strict';

const Address = require('./address');
const logger  = require('../logger');

module.exports = function updateAddress(query, newValues) {

    if (!query || !newValues) {
        return Promise.reject('invalid parameters');
    }

    return Address
        .update(query, newValues)
        .catch(logger.error);
};
