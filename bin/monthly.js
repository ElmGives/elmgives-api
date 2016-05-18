'use strict';

/**
 * This process runs every month.
 * Is in charge of charge users and transfer those charges to user selected NPO
 */

const monthlyProcess = require('../monthly/monthly_process');

const ONE_DAY = 1000 * 60 * 60 * 24;
const PROCESS_DATE = 26;

/**
 * We run this monthly process every [[PROCESS_DATE]] day of the month.
 * Because some months have 31 days we can't just use 30 days for our setTimeout
 */
function run() {
    
    const date = new Date();
    
    if (date.getDate() === PROCESS_DATE) {
        monthlyProcess.run();
    }
    
    setTimeout(() => run(), ONE_DAY);
}

run();

// TODO: we have to have two processes: one for monthly charges and one for assigning a new address on the start of the month
