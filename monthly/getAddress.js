'use strict';

const readAddress = require('../addresses/read');

/**
 * Retrieves an Address and moves the generator passed
 * @param   {String}    addressId
 * @param   {generator} generator
 */
function getAddress(addressId, generator) {
    
    if (!addressId) {
        let error = new Error('no-address-id');
        
        error.status = 402;
        error.description = 'No address was passed';
        
        throw error;
    }
    
    const query = {
        address: addressId,
    };

    readAddress(query)
        .then(generator.next)
        .catch(generator.throw);
}

module.exports = getAddress;
