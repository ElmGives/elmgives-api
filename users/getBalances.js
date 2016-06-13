/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');
const objectId = require('mongoose').Types.ObjectId;
const logger = require('../logger');
const Npo = require('../npos/npo');


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
            return getVerifiedAddressBalance(pledge.addresses[date])
                .then(address => {
                    return {
                        date: date,
                        balance: Math.abs(address.balance),
                        currency: address.currency
                    };
                })
                .catch(error => {
                    logger.error({err: error});
                    return undefined;
                });
        });
        return Promise.all(promises)
            .then(balances => {
                return Npo.findOne({_id: objectId(pledge.npoId)}, {select: 'logoUrl'})
                    .then(npo => {
                        if (!npo) {
                            let error = new Error();
                            error.message = 'pledge.npoId not found';
                            return Promise.reject(error);
                        }
                        return {
                            id: pledge.npoId,
                            logo: npo.logoUrl,
                            balances: balances
                        };
                    });
            });
    });

    Promise.all(promises)
        .then(balances => {
            response.json({
                data: balances,
                meta: {
                    count: balances.length
                }
            });
        })
        .catch(next);
};
