/**
 * Valdiate images / videos arrays
 */
'use strict';

module.exports = function validMedia(data) {

    /**
     * Allow admin user to create a post without images or videos, therefore
     * empty data is a valid option
     */
    if (!data || !data.length) {
        return true;
    }

    if (typeof data === 'string') {
        data = [data];
    }

    return data.some(item => item.source && item.order);
};
