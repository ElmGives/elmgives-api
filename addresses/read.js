/**
 *
 */
'use strict';

const Address = require('./address');
const logger  = require('../logger');

module.exports = function readAddress(query) {

    if (!query) {
        return Promise.reject('Invalid query');
    }

    return Address.find(query).catch(logger.error);
};

