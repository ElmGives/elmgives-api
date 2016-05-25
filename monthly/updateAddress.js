'use strict';

const update = require('../addresses/update');

/**
 * @param   {String}    address
 * @param   {generator} generator
 */
function updateAddress(address, chargeId, generator) {
    const query = {
        address: address,
    };
    
    const newValue = {
        $set: {
            charge: chargeId,
        },
    };
    
    update(query, newValue)
        .then(generator.next)
        .catch(generator.throw);
}

module.exports = updateAddress;
