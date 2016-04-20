/**
 *
 */
'use strict';

const Address = require('./address');
const logger  = require('../logger');

module.exports = function readAddress(query) {

    if (!query) {
        let error = new Error('Invalid query');
        return Promise.reject(error);
    }

    return Address
        .findOne(query)
        .then(address => {
            
            if (!address) {
                let error = new Error('No address found');
                return Promise.reject(error);
            }
            
            return address;
        }).catch(error => logger.error);
};

