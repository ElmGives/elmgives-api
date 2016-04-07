/**
 * Runs round up process every [INTERVAL] milliseconds
 */

'use strict';

const fork = require('child_process').fork;

// 24 hours in milliseconds
const INTERVAL = 1000 * 60 * 60 * 24;

function run() {
    fork('./roundup/supervisor.js');

    setTimeout(() => run(), INTERVAL);
}

run();
