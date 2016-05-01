/**
 * Middleware to associate npos, banks and current user
 */
'use strict';

const Charity = require('./pledge');
const NPO = require('../npos/npo');
const Bank = require('../banks/bank');

module.exports = (request, response, next) => {
    const userId = request.body.userId + '';

    if (request.session.userId + '' !== userId) {
        return response.status(401).json({
            error: {
                message: 'user not authorized'
            }
        });
    }

    let user = request.currentUser;

    let npo = NPO.findOne({
        _id: request.body.npoId
    });

    let bank = Bank.findOne({
        _id: request.body.bankId
    });

    let exist = user.pledges.some(item => {
        return item.npoId + '' === request.body.npoId &&
            item.bankId + '' === request.body.bankId;
    });

    if (exist) {
        let error = new Error();
        error.status = 422;
        error.message = 'Charity already exist';

        return next(error);
    }

    Promise
        .all([npo, bank])
        .then(values => {
            npo = values[0];
            bank = values[1];
            if (!npo || !bank) {
                let error = new Error();
                error.status = 422;
                error.message = 'Proper fields values required';

                return next(error);
            }
            return triggerPlaidLinkExchange(request, bank.type);
        })
        .then(() => {
            let pledge = {
                monthlyLimit: request.body.monthlyLimit,
                npoId: request.body.npoId,
                bankId: request.body.bankId,
                npo: npo.name,
                bank: bank.name,
                userId: request.session.userId
            };

            return new Charity(pledge);
        }, error => {
            return next(error);
        })
        .then(pledge => {
            user.pledges.push(pledge);
            request.pledgeId = pledge._id;
            return user.save();
        })
        .then(( /*user*/ ) => response.json({
            data: [user.pledges.id(request.pledgeId)]
        }))
        .catch(next);
};

function triggerPlaidLinkExchange(request, institution) {
    /* jshint camelcase:false */
    let publicToken = request.body.public_token;
    let accountID = request.body.account_id;
    let user = request.currentUser;
    let plaid = request.plaid;
    let error = new Error();

    if (!publicToken) {
        error.status = 400;
        error.message = 'Missing public_token';
        return Promise.reject(error);
    }
    if (!institution) {
        error.status = 400;
        error.message = 'Missing institution type';
        return Promise.reject(error);
    }
    if (!accountID) {
        error.status = 400;
        error.message = 'Missing account ID';
        return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
        plaid.client.exchangeToken(publicToken, accountID, function (err, response) {
            if (err) {
                error.status = err.statusCode || 400;
                error.message = err.message || err.resolve;
                return reject(error);
            }

            let accessToken = response.access_token;
            let stripeToken = response.stripe_bank_account_token;
            if (!accessToken) {
                error.status = 422;
                error.message = 'Access token could not be retrieved';
                return reject(error);
            }

            let query = {};
            query['plaid.tokens.connect.' + institution] = accessToken;
            query['stripe.token'] = stripeToken;
            user.update(query)
                .then(function () {
                    return resolve({
                        data: {
                            access_token: accessToken,
                            stripe_token: stripeToken
                        }
                    });
                })
                .catch(reject);
        });
    });
}
