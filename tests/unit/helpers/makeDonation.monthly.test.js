'use strict';

const tape = require('tape');
const logger = require('../../../logger');
const helper = require('../../../monthly/makeDonation');
const sinon = require('sinon');

tape('Tests the helper gets the parameters it needs', test => {
    test.plan(1);
    
    const stripeResponse = {
        id: 'one',
        object: 'charge',
        amount: 1000,
        /* jshint camelcase: false */
        application_fee: 50,
        currency: 'usd',
        custoemr: 'cus_khkjh',
        /* jshint camelcase: false */
        balance_transaction: 'jkhkjh',
    };
    
    sinon.stub(helper._stripe.charges, 'create', function(properties, callback) {
        
        // This ensures generator is paused before running the callback calling
        setTimeout(() => callback(null, stripeResponse));
    });
    
    let gen = (function *() {
       
        try {
            let expected = 'one';
            let actual = yield helper.makeDonation(10, 'usd', 'cus_khkjh', 'sadasd', 5, gen);
            
            test.equal(actual && actual.id, expected, 'We should receive a stripe response object');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        test.end();
    })();
    
    gen.next();
});