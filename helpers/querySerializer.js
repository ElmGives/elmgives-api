/**
 * Serialize Express requests
 * Used to log access to the system
 */
'use strict';

module.exports = (data) => {
    let query = JSON.stringify(data.query || {});
    let doc = data.doc || {};
    let fields = JSON.stringify(doc.fields || {});

    let result = `db.${data.coll}.${data.method}(${query}`;

    if (doc.fields) {
        result = `${result}, ${fields})`;
    } else {
        result = `${result})`;
    }

    if (doc.limit) {
        result = `${result}.limit(${doc.limit})`;
    }

    if (doc.skip) {
        result = `${result}.skip(${doc.skip})`;
    }

    if (doc.sort) {
        let sort = JSON.stringify(doc.sort);
        result = `${result}.sort(${sort})`;
    }

    return result;
};
