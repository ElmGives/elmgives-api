'use strict';

/**
 * This process runs every month.
 * Is in charge of charge users and transfering those charges to user selected NPO
 */

const chargeProcess = require('../monthly/charge_process');
const assignAddressProcess = require(',./monthly/assign_address_process');
const notify = require('../slack/index');
const logger = require('../logger');

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

        try {
            chargeProcess();
        }
        catch (error) {
            notify('Charge process got an unexpected error: ' + error);

            logger.error({ err: error });
        }
    }

    if (date === NEW_ADDRESS_DAY) {

        try {
            assignAddressProcess();
        }
        catch (error) {
            notify('Address assignment process got an unexpected error: ' + error);
            
            logger.error({ err: error });
        }
    }
}

run();
