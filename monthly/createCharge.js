'use strict';

const Charge = require('../charges/charge');

/**
 * Adds a new entry to Charges collection detailing what addresses were involved in the charge
 * We need to filter the addresses array because we may receive empty values when the user has no record on 
 * previous months 
 * @param   {String[]}     addresses   Addresses that where used for charging the user
 * @param   {Number}    amount
 * @param   {String}    currency
 * @param   {generator} generator
 */
function createCharge(addresses, amount, currency, generator) {
    
    if (!addresses.length) {
        let error = new Error('addresses-not-an-array');
        error.status = 404;
        error.description = `Received ${addresses} instead of a valid Array`;
        
        generator.throw(error);
        return;
    }
    
    addresses = addresses.filter(address => !!address);
    
    const query = {
        addresses: addresses,
        amount: amount,
        currency: currency,
    };

    new Charge(query)
        .save()
        .then(charge => generator.next(charge))
        .catch(error => generator.throw(error));
}

module.exports = createCharge;
