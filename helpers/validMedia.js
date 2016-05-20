/**
 * Valdiate images / videos arrays
 */
'use strict';

const types = {
    images: (data) => data.some(item => item.source && item.order),
    videos: (data) => data.some(item => item.source && item.order && item.shareUrl),
};

module.exports = function validMedia(data, type) {

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

    return types[type] && types[type](data);
};
