'use strict';

const padNumber = require('./padNumber');

/**
 * Gets a string format for pledge addresses like '2016-05' for May 2016
 * @param   {Date}  date
 * @returns {String}
 */
function getYearMonth(date) {
    return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;
}

module.exports = getYearMonth;
