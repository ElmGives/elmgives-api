'use strict';

require('dotenv').config();
require('../../../config/database');

const tape = require('tape');
const updateAddressCharge = require('../../../monthly/updateAddressCharge');
const Address = require('../../../addresses/address');
const logger = require('../../../logger');

tape('Update address helper', test => {
    test.plan(1);
    
    function getAddress(address, generator) {
        Address.findOne({ address: address }).then(found => generator.next(found));
    }
    
    let gen = (function *() {
        
        // Taken from db/address.json
        const address = 'wWRFTz8DQyiVQdomTWJBJqXXV8SNCbxxHi';
        const charge = 'one_' + Date.now();
        
        try {
            yield updateAddressCharge(address, charge, gen);
            
            let expected = charge;
            let actual = yield getAddress(address, gen);
            
            test.equal(actual && actual.charge, expected, 'Charge Id should be on address object');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        test.end();
        // process.exit(0);
    })();
    
    gen.next();
});