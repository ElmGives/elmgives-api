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
        .exec()
        .then(address => {
            
            if (!address) {
                let error = new Error('no-address-found');
                error.status = 404;
                error.description = `Address ${ query.address } doesn't exist on Address collection`;
                
                return Promise.reject(error);
            }
            
            return address;
        }).catch(error => logger.error({ err: error }));
};

