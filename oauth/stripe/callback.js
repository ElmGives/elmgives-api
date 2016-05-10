/*
 * Handle Stripe OAuth authorization code exchange for an access token
 */
/* jshint camelcase: false */
'use strict';

const Npo = require('../../npos/npo');
const httpRequest = require('request');
const stripeOAuthTokenURL = 'https://connect.stripe.com/oauth/token';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../../logger');

module.exports = function exchangeStripeOAuthCode(request, response, next) {
    let authorizationCode = request.query.code;

    httpRequest({
        method: 'POST',
        url: stripeOAuthTokenURL,
        body: {
            code: authorizationCode,
            grant_type: 'authorization_code',
            client_secret: process.env.STRIPE_SECRET_KEY
        },
        json: true
    }, (error, res) => {
        let accountID = res.body.stripe_user_id;
        console.log(error, res.body.error, accountID);
        if (error || res.body.error || !accountID) {
            error = new Error();
            error.status = 400;
            error.message = res.body.error_description ||
                'The account ID could not be retrieved with the provided authorization code';
            return response.json(error || res.body.error);
        }

        return storeNpoConnectedAccountID(accountID)
            .then(updated => {
                response.status(200).json({data: {ok: updated}}); //redirect?
            })
            .catch(err => {
                let error = new Error();
                error.message = `NPO account ID ${accountID} could not be saved`;
                logger.error(error);
                response.status(200).json({data: {ok: false}}); //redirect?
            });
    });
};

function storeNpoConnectedAccountID(accountID) {
    return stripe.accounts.retrieve(accountID)
        .then(account => {
            if (!account.email) {
                let error = new Error();
                error.message = `No NPO found for email ${account.email} to store account ID ${accountID}`;
                return logger.error(error);
            }

            return Npo.update({
                email: account.email
            }, {
                $set: {
                    'stripe.accountId': accountID
                }
            })
            .then(result => {
                return result.n === 1; // number of modified fields
            });
        });
}
