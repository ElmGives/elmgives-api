/**
 *
 */
'use strict';

const Address = require('./address');
const logger  = require('../logger');

module.exports = function updateAddress(query, newValues) {

    if (!query || !newValues) {
        let error = new Error('invalid parameters');
        return Promise.reject(error);
    }

    return Address
        .update(query, newValues)
        .exec()
        .catch(logger.error);
};
