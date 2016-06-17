/**
 * Retrieves the transaction history of a pledge
 */
'use strict';

const getVerifiedAddressBalance = require('../helpers/verifiedAddressBalance');
const mongoose = require('mongoose');
const logger = require('../logger');
const Npo = require('../npos/npo');


module.exports = function getBalancesPerMonth(request, response, next) {
    let user = request.currentUser;
    let userID = request.params.id;
    let pledgeID = request.params.pledgeId;
    let pledge = user.pledges.find(pledge => String(pledge._id) === pledgeID);
    let error = new Error();
    let npoLogoUrl;

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

    let query = {_id: mongoose.Types.ObjectId(pledge.npoId)};
    let options = {select: 'logoUrl'};

    Npo.findOne(query, options)
        .then(npo => {
            if (!npo) {
                let error = new Error();
                error.message = 'pledge.npoId not found';
                return Promise.reject(error);
            }
            npoLogoUrl = npo.logoUrl;
            return Promise.all(promises);
        })
        .then(balances => {
            balances = balances.filter(element => {
                return typeof element === 'object';
            });

            response.json({
                data: {
                    logo: npoLogoUrl,
                    balances: balances
                },
                meta: {
                    count: balances.length
                }
            });
        })
        .catch(next);
};
