/**
 * We receive the amount and use multiplication because the way Javascript handles float point arithmetic
 * Example: 5.45 => 0.55 (5.45 + 0.55 = 6.00)
 * @param   {number|string} amount The amount to be rounded up
 * @return  {number}
 */

'use strict';

module.exports  = function roundup(amount) {

    // This is necessary because of JavaScript float point arithmetic
    let number  = parseFloat(amount);
    let ceil    = Math.ceil(number);
    let hundred = (ceil * 100 ) - (number * 100);

    return hundred / 100;
};
