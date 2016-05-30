'use strict';

require('dotenv').config();
require('../../../config/database');

const tape = require('tape');
const addCustomerIdOnDatabase = require('../../../monthly/addCustomerIdOnDatabase');
const User = require('../../../users/user');
const logger = require('../../../logger');

tape('Tests update Stripe customer attribute on User collection', test => {
    test.plan(1);
    
    function findJhon(generator) {
        User.findOne({ name: 'johndoe' }).then(john => generator.next(john));
    }
    
    let gen = (function *() {
        let john = yield findJhon(gen);
        
        if (!john) { logger.error({ err: new Error('John Doe was not found on User collection') }); }
        
        const userWithCustomer = {
            _id: john._id,
            stripe: {
                wells: {
                    customer: {
                        id: 'one',
                    },
                },
            },
        };
        
        try {
            yield addCustomerIdOnDatabase(userWithCustomer, 'wells', gen);
            
            let expected = 'one';
            let actual = yield findJhon(gen);
            
            test.equal(actual && actual.stripe.wells.customer.id, expected, 'Update user document with stripe customer information');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        test.end();
        process.exit(0);
    })();
    
    gen.next();
});