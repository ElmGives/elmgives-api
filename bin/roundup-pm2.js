/**
 * Runs round up process every [ONE_DAY] milliseconds
 */

'use strict';

const notify = require('../slack/index');

// 24 hours in milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

const roundupProcess = require('../roundup/roundupProcess');
const logger = require('../logger');

function run() {
    notify('Round up process starts');

    try {
        roundupProcess.run();
    }
    catch (error) {
        notify('Round up process got an unexpected error: ' + error.message);
        logger.error({ err: error });
    }

    setTimeout(() => run(), ONE_DAY);
}

run();
