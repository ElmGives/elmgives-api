'use strict';

require('dotenv').config();
require('../../../config/database');

const tape = require('tape');
const createCharge = require('../../../monthly/createCharge');
const logger = require('../../../logger');

tape('createCharge helper', test => {
    test.plan(2);
    
    let gen = (function *() {
        let addresses = ['one', 'two'];
        const amount = 10.00;
        const currency = 'usd';
        
        let actual = null;
        
        try {
            actual = yield createCharge(addresses, amount, currency, gen);
            let expected = 2;        // Numberof addresses inside new charge
            
            test.equal(actual.addresses.length, expected, 'Should add both addresses on the new charge');
        }
        catch(error) {
            logger.error({ err: error });
        }
        
        try {
            addresses = ['one', undefined];
            
            actual = yield createCharge(addresses, amount, currency, gen);
            let expected = 1;
            
            test.equal(actual.addresses.length, expected, 'Should add just one addresses on the new charge');
        }
        catch(error) {
            logger.error({ err: error });
        }
        
        test.end();
        // process.exit(0);
    })();
    
    gen.next();
});