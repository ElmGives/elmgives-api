/**
 * Default error for method not allowed
 */
'use strict';

module.exports = function notAllowed(request, response) {
    return response.status(405).json({
        error: 'Method not allowed'
    });
};
