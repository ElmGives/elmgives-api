/**
 * We receive the amount and use multiplication because the way Javascript handles float point arithmetic
 * Example: 5.45 => 0.55 (5.45 + 0.55 = 6.00)
 * @param   {number|string} amount The amount to be rounded up
 * @return  {number}
 */

'use strict';

module.exports  = function roundup(amount) {
    let roundup = 0;
    let fractional = Math.abs(parseFloat(amount)) % 1;

    if (fractional > 0 && fractional < 1) {
        roundup = 1 - fractional.toFixed(2);
        roundup = parseFloat(roundup.toFixed(2));
    }

    return roundup;
};
