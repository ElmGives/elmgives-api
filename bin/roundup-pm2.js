/**
 * Runs round up process every [INTERVAL] milliseconds
 */

'use strict';

// 24 hours in milliseconds
const INTERVAL = 1000 * 60 * 60 * 24;

const cluster = require('../roundup/cluster');

function run() {
    cluster.runWith();
    setTimeout(() => run(), INTERVAL);
}

run();
