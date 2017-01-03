/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const objectId = require('mongoose').Types.ObjectId;
const getYearMonth = require('../helpers/getYearMonth');
const Charge = require('../charges/charge');
const Npo = require('../npos/npo');
const logger = require('../logger');


module.exports = function getBalances(request, response, next) {
    let user = request.currentUser;
    let userID = request.params.id;
    let error = new Error();

    if (String(request.session.userId) !== userID) {
        error.status = 401;
        error.message = 'unauthorized-user';
        return next(error);
    }

    let promises = user.pledges.map(pledge => {
        /* Retrieve the transactions of (each/all of) the pledge addresses */
        let dates = Object.keys(pledge.addresses || {}).sort().reverse();
        let promises = dates.map((date, index) => {
            return getAddressCharge(pledge.addresses[date], date)
                .catch(error => {
                    logger.error({err: error});
                    return undefined;
                });
        });

        return Promise.all(promises)
            .then(charges => {
                let selectFields = {logoUrl: 1, logoUrls: 1};
                return Npo.findOne({_id: objectId(pledge.npoId)}, selectFields)
                    .then(npo => {
                        if (!npo) {
                            let error = new Error();
                            error.message = 'pledge.npoId not found';
                            return Promise.reject(error);
                        }
                        return {
                            id: pledge.npoId,
                            logo: npo.logoUrl,
                            charges: charges
                        };
                    });
            });
    });

    Promise.all(promises)
        .then(charges => {
            response.json({
                data: charges,
                meta: {
                    count: charges.length
                }
            });
        })
        .catch(next);
};

/**
 *
 */
function getAddressCharge(address, date) {
    let noCharge = {amount: 0, date};

    return Charge.findOne({addresses: {$in: [address]}})
        .then(charge => {
            if (!charge || charge.addresses.indexOf(address) !== 0) {
                return noCharge;
            }

            return {
                amount: charge.amount,
                currency: charge.currency,
                date: date || getYearMonth(new Date(charge.date))
            };
        });
}
