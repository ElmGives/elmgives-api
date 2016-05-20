/**
 * 
 */
'use strict';

const Bank = require('./bank');
const logger = require('../logger');

module.exports = (query) => {
    
    if (!query) {
        const error = new Error('There is no query to do');
        return Promise.reject(error);
    }

    return Bank
        .findOne(query)
        .exec()
        .catch( error => logger.error({ err: error }));
};
