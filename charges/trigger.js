/**
 * 
 */
'use strict';

const Charge = require('./charge');
const Npo = require('../npos/npo');
const User = require('../users/user');
const processCharge = require('./process');

module.exports = function triggerCharge(options) {
    let charge = options.charge;
    let query = {
        _id: options.id
    };

    let promise = charge ? Promise.resolve(charge) : Charge.findOne(query);

    return promise
        .then(_charge => {
            charge = _charge;
            if (!charge) {
                return Promise.reject(new Error('charge-not-found'));
            } else if (!options.status && charge.status !== 'pending') {
                return Promise.reject(new Error('charge-not-pending'));
            } else if (!charge.bankType) {
                return Promise.reject(new Error('missing-charge-bank-type'));
            }

            return Promise.all([
                User.findOne({_id: charge.userId}, {stripe: 1}),
                Npo.findOne({_id: charge.npoId}, {name: 1, stripe: 1})
            ]);
        })
        .then(results => {
            let user = results[0];
            let npo = results[1];

            if (!user.stripe[charge.bankType]) {
                return Promise.reject(new Error('user-missing-stripe-info'));
            }

            let customer = user.stripe[charge.bankType].customer;
            let chargeOptions = {
                destination: npo.stripe.accountId,
                description: npo.name,
                'application_fee': charge.details.fee
            };

            return processCharge(charge, customer, chargeOptions);
        });
};
