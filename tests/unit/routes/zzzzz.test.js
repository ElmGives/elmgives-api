/**
 * Because on first test files we are using `require('./config').database()` we need to end this in order
 * on the last file that npm test process which is this one.
 */
'use strict';

const tape = require('tape');
const mongoose = require('mongoose');

tape('Ends tests', test => {
    test.plan(1);
    
    test.equal(true, true, 'Should end tests');
    
    test.end();
    
    mongoose.connection.removeAllListeners();
    mongoose.disconnect();
    // process.exit(0);
});