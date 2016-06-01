'use strict';

// require('dotenv').config();
// require('../../../config/database');

const tape = require('tape');
const sinon = require('sinon');
const createNewAddress = require('../../../monthly/createNewAddress');
const User = require('../../../users/user');
const logger = require('../../../logger');

tape('Create New Address helper', test => {
    test.plan(4);
    
    const awsResponse = {
        MessageId: 'one',
    };
    
    sinon.stub(createNewAddress._aws, 'sendMessage').returns(Promise.resolve(awsResponse));
    
    function findJhon(generator) {
        User.findOne({ name: 'johndoe' }).then(john => generator.next(john));
    }
    
    let gen = (function *() {
        let john = yield findJhon(gen);
        
        if (!john) { logger.error({ err: new Error('John Doe was not found on User collection') }); }
        
        try {
            let pledgeId = john.pledges[0]._id;
            
            let expected = 'object';
            let actual = typeof pledgeId;
            
            test.equal(actual, expected, 'PledgeId should be a String');
            
            let monthlyLimit = john.pledges[0].monthlyLimit;
            
            expected = 'number';
            actual = typeof monthlyLimit;
            
            test.equal(actual, expected, 'Monthly limit should be a number');
            
            expected = true;
            actual = monthlyLimit > 0;
            
            test.equal(actual, expected, 'Monthly limit should be greater than zero');
            
            expected = true;
            actual = yield createNewAddress.createNewAddress(john._id, pledgeId, monthlyLimit, gen);
            
            test.equal(!!actual, expected, 'We should have something from AWS manager');
        }
        catch (error) {
            logger.error({ err: error });
        }
        
        // test.end();
        // process.exit(0);
    })();
    
    gen.next();
});