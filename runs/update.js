'use strict';

const Run = require('./run');
const logger = require('../logger');

module.exports = function updateRun(query, newValues) {
    
    if (!query || !newValues) {
        let error = new Error('It is missing a query or new values to update');
        return Promise.reject(error);
    }
    
    return Run
        .findOneAndUpdate(query, newValues, { upsert: true })
        .exec()
        .catch(error => logger.info( error ));
};
