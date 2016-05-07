/*
 * Handle Stripe OAuth authorization code exchange for an access token
 */
/* jshint camelcase: false */
'use strict';

const httpRequest = require('request');
const stripeOAuthTokenURL = 'https://connect.stripe.com/oauth/token';

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
        if (error) {return next(error);}

        /* PENDING: store stripeConnectedID under NPO object */
        // let stripeConnectedID = res.stripe_user_id;

        response.status(200).end(); // redirect page?
    });
};
