/**
 * Default response format
 */
'use strict';

module.exports = (response) => {
    return (data) => {
        return response.json({
            data: data
        });
    };
};
