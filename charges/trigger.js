/**
 * 
 */
'use strict';

const Charge = require('./charge');
const processCharge = require('./process');

module.exports = function triggerCharge(options) {
    let query = {
        _id: options.id
    };

    return Charge.findOne(query)
        .then(charge => {
            if (!charge) {
                let error = new Error();
                error.message = 'charge-not-found';
                return Promise.reject(error);
            }

            return processCharge(charge);
        });
};
