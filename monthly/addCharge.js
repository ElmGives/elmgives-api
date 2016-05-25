'use strict';

const Charges = require('../charges/charge');

/**
 * Adds a new entry to Charges collection detailing what addresses where involved in the charge
 * We need to filter the addresses array because we may receive empty values when user has no record on 
 * previoues months 
 * @param   {Array}     addresses   Addresses that where used for charging the user
 * @param   {Number}    amount
 * @param   {String}    currency
 * @param   {generator} generator
 */
function addCharge(addresses, amount, currency, generator) {
    
    if (!addresses.length) {
        let error = new Error('addresses-in-not-an-array');
        error.status = 404;
        error.description = `Received ${addresses} instead of a valid Array`;
        
        generator.throw(error);
    }
    
    addresses = addresses.filter(address => !!address);
    
    const query = {
        addresses: addresses,
        amount: amount,
        currency: currency,
    };
    
    new Charges(query)
        .save()
        .then(generator.next)
        .catch(generator.throw);
}

module.exports = addCharge;
