/**
 * Serialize Express requests
 * Used to log access to the system
 */
'use strict';

module.exports = (data) => {
    let query = JSON.stringify(data.query).replace(/\"/g, '');
    let options = JSON.stringify(data.options || {});

    return `db.${data.coll}.${data.method}(${query}, ${options});`;
};
