'use strict';

/**
 * This process runs every month.
 * Is in charge of charge users and transfering those charges to user selected NPO
 */

const monthlyProcess = require('../monthly/monthly_process');

const ONE_DAY = 1000 * 60 * 60 * 24;
const CHARGE_DAY = 5;
const NEW_ADDRESS_DAY = 1;

/**
 * We run this monthly process every [[CHARGE_DAY]] and [[NEW_ADDRESS_DAY]] day of the month.
 * Because some months have 31 days we can't just use 30 days for our setTimeout
 */
function run() {
    setTimeout(run, ONE_DAY);

    const date = (new Date()).getDate();

    if (date === CHARGE_DAY) {
        monthlyProcess.charge();
    }

    if (date === NEW_ADDRESS_DAY) {
        monthlyProcess.assignNewAddress();
    }
}

run();
