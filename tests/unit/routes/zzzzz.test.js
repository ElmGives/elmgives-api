/**
 * Because on first test files we are using `require('./config').database()` we need to end this in order
 * on the last file that npm test process which is this one.
 */
'use strict';

const tape = require('tape');

tape('Ends tests', test => {
    test.plan(1);
    
    test.equal(true, true, 'Should end tests');
    
    test.end();
    process.exit(0);
});