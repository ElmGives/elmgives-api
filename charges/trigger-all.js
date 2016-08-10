/**
 * 
 */
'use strict';

const Charge = require('./charge');
const processCharge = require('./process');

const P = require('bluebird');
const PROMISE_CONCURRENCY = 10;
const logger = require('../logger');

module.exports = function triggerCharge(options) {
    let query = {
        status: 'pending'
    };

    return Charge.find(query)
        .then(charges => {
            if (!charges || charges.length === 0) {
                logger.info('no-pending-charges-found');
                return Promise.resolve();
            }

            return P.map(charges, charge => {
                return processCharge(charge);
            }, {concurrency: PROMISE_CONCURRENCY});
        })
        .catch(error => {
            logger.error({err: error});
        });
};
