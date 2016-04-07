/**
 * Valdiate images / videos arrays
 */
'use strict';
module.exports = function validMedia(array) {

    /**
     * Allow admin user to create a post without images or videos, therefore
     * empty array is a valid option
     */
    if (!array || !array.length) {
        return true;
    }

    return array.some(item => item.source && item.order);
};
