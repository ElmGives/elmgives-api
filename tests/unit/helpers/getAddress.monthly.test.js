'use strict';

// require('dotenv').config();
// require('../../../config/database');

const logger = require('../../../logger');
const getAddress = require('../../../monthly/getAddress');
const tape = require('tape');

tape('Tests we can get an Address correctly', test => {
    test.plan(1);
    
    let gen = (function *() {
        
        // Data taken from /db/addresses.json file
        let addressId = 'wWRFTz8DQyiVQdomTWJBJqXXV8SNCbxxHi';
        let expected = '5184599b363107910b95eb46beffe86596d49999e3f510db07222d523071b393';
        
        try {
            let actual = yield getAddress(addressId, gen);
            
            test.equal(actual && actual.latestTransaction, expected, 'An address has a latestTransaction property');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        test.end();
        // process.exit(0);
    })();
    
    gen.next();
});