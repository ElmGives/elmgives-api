/**
 * Runs round up process every [ONE_DAY] milliseconds
 */

'use strict';

// 24 hours in milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

const roundupProcess = require('../roundup/roundupProcess');

function run() {
    roundupProcess.run();
    setTimeout(() => run(), ONE_DAY);
}

run();
