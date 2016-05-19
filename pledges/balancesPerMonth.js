/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');
const logger = require('../logger');

module.exports = function getBalancesPerMonth(request, response, next) {
    let user = request.currentUser;
    let userID = request.params.id;
    let pledgeID = request.params.pledgeId;
    let pledge = user.pledges.find(pledge => String(pledge._id) === pledgeID);
    let error = new Error();

    if (String(request.session.userId) !== userID) {
        error.status = 401;
        error.message = 'unauthorized-user';
        return next(error);
    }
    if (!pledge) {
        error.status = 404;
        error.message = 'pledge-not-found';
        return next(error);
    }

    /* Retrieve the transactions of (each/all of) the pledge addresses */
    let dates = Object.keys(pledge.addresses || {}).sort().reverse();
    let promises = dates.map((date, index) => {
        return getVerifiedAddressBalance(pledge.addresses[date])
            .then(address => {
                return {
                    balance: Math.abs(address.balance),
                    currency: address.currency
                };
            })
            .catch(error => {
                logger.error({err: error});
                return undefined;
            });
    });

    Promise.all(promises)
        .then(balances => {
            let balancesPerMonth = dates.reduce((reduced, date, index) => {
                reduced[date] = balances[index];
                return reduced;
            }, {});
            let count = Object.keys(balancesPerMonth).filter(date => {
                return typeof balancesPerMonth[date] === 'object';
            }).length;

            response.json({
                data: balancesPerMonth,
                meta: {
                    count: count
                }
            });
        });
};
