/**
 * 
 */
'use strict';

const Charge = require('./charge');
const triggerCharge = require('./trigger');

const P = require('bluebird');
const PROMISE_CONCURRENCY = 10;
const logger = require('../logger');

module.exports = function triggerCharges(options) {
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
                return triggerCharge(charge)
                    .catch(error => {
                        error.details = {
                            chargeId: charge._id
                        };
                        logger.error({err: error});
                    });
            }, {concurrency: PROMISE_CONCURRENCY});
        })
        .catch(error => {
            logger.error({err: error});
        });
};
