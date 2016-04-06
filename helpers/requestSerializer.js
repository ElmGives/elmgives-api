/**
 * Serialize Express requests
 * Used to log access to the system
 */
'use strict';

module.exports = request => {
    return {
        method: request.method,
        url: request.url
    };
};
