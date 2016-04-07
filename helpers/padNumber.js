/**
 * Add a zero when a number is less than 10.
 * Example: 4  => '04'
 * Example: 12 => '12'
 * @param  {number}
 * @return {string}
 */
'use strict';

module.exports = (number) => (number < 10) ? `0${number}` : `${number}`;
