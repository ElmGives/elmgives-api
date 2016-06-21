'use strict';

const getYearMonth = require('../helpers/getYearMonth');
const MONTHS_TO_PROCESS = 2;

/**
 * Looks for addresses for months specified by [[MONTHS_TO_PROCESS]]
 * @param   {Object}    activePledge
 * @returns {String[]}  addresses
 */
function getPastAddresses(activePledge) {
    console.assert(typeof activePledge === 'object', 'activePledge should be an object');
    console.assert('addresses' in activePledge, 'activePledge should contain a property called addresses');

    let addresses = [];

    // We need to get transactions for last month
    let date = new Date();

    for (let month = 0; month < MONTHS_TO_PROCESS; month += 1) {

        date.setMonth(date.getMonth() - 1);
        let lastMonth = getYearMonth(date);
        let address = activePledge.addresses[lastMonth];

        if (address) {
            addresses.push(address);
        }
    }

    return addresses;
}

module.exports = getPastAddresses;
