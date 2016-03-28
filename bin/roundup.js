/**
 * Runs round up process every [INTERVAL] milliseconds
 */

'use strict';

const fork = require('child_process').fork;

const INTERVAL = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

function run() {
    fork('./roundup/supervisor.js');

//    setTimeout(() => run(), INTERVAL);    // TODO: Activate this timeOut
}

run();
