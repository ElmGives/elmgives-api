/**
 * Return a Random four digits number
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */

'use strict';

const MAX = 9999;
const MIN = 1000;

module.exports = (min, max) => {
    min = min || MIN;
    max = max || MAX;

    return Math.floor(Math.random() * (max - min)) + min;
};
