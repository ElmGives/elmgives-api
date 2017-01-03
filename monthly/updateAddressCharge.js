'use strict';

const update = require('../addresses/update');

/**
 * @param   {String}    address
 * @param   {generator} generator
 */
function updateAddressCharge(address, chargeId, generator) {
    const query = {
        address: address,
    };
    
    const newValue = {
        $set: {
            charge: chargeId,
        },
    };
    
    update(query, newValue)
        .then(update => generator.next(update))
        .catch(error => generator.throw(error));
}

module.exports = updateAddressCharge;
