'use strict';

// require('dotenv').config();
// require('../../../config/database');

const tape = require('tape');
const removeStripeToken = require('../../../monthly/removeStripeToken');
const User = require('../../../users/user');
const logger = require('../../../logger');

tape('Remove Stripe token helper', test => {
    test.plan(2);
    
    function findJhon(generator) {
        User.findOne({ name: 'johndoe' }).then(john => generator.next(john));
    }
    
    function addTokenToUser(userId, generator) {
        User.update({ _id: userId }, { $set: { 'stripe.wells.token': 'one' }}).then(() => generator.next());
    }
    
    let gen = (function *() {
        let john = yield findJhon(gen);
        
        if (!john) { logger.error({ err: new Error('John Doe was not found on User collection') }); }
        
        yield addTokenToUser(john._id, gen);
        
        try {
            let expected = 1;
            let actual = yield removeStripeToken(john, 'wells', gen);
            
            test.equal(actual && actual.ok, expected, 'Update user document removing stripe token');
            
            expected = true;
            actual = yield findJhon(gen);
            
            test.equal('token' in actual.stripe.wells == false, expected, 'Checked the token is not on User collection');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        // test.end();
        // process.exit(0);
    })();
    
    gen.next();
});