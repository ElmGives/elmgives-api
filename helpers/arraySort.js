/**
 * Returns a compare function to be used in Array.sort
 * Usage:
 *     myArray.sort(sort('timestamp'))
 */
'use strict';

module.exports = (property, descending) => {
    return (firstObject, secondObject) => {
        if (descending) {
            return firstObject[property] < secondObject[property] ? 1 : -1;
        }
        return firstObject[property] < secondObject[property] ? -1 : 1;
    };
};
