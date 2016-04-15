/*
 * Handle Plaid Connect stepConnectUser
 */
/* jshint camelcase: false */

 'use strict';

module.exports = function stepConnectUser(request, response, next) {
    let plaid = request.plaid;
    let multiFactorAuthentication = request.body.mfa;
    let institution = request.body.institution;
    let plaidAccessToken;
    let error = new Error();

    try {
        plaidAccessToken = request.currentUser.plaid.tokens.connect[institution];
    } catch (err) {
        error.status = 422;
        error.message = 'error from server';
        return next(error);
    }

    if (!institution) {
        error.status = 400;
        error.message = 'Missing institution type';
        return next(error);
    }
    if (!plaidAccessToken) {
        error.status = 400;
        error.message = 'Missing Plaid access token. Please obtain one and try again.';
        return next(error);
    }
    if (typeof multiFactorAuthentication !== 'object' ||
        !(multiFactorAuthentication.answer ||
        multiFactorAuthentication.method)) {
        error.status = 400;
        error.message = 'Missing MFA parameters';
        return next(error);
    }

    multiFactorAuthentication.method = multiFactorAuthentication.method ? 
        {send_method: {type: multiFactorAuthentication.method}} : {};
    plaid.client.stepConnectUser(plaidAccessToken, multiFactorAuthentication.answer,
        multiFactorAuthentication.method, function(plaidError, multiFactorAuthenticationResponse) {
        if (plaidError) {
            error.status = plaidError.statusCode || 400;
            error.message = plaidError.message || plaidError.resolve;
            return next(error);
        }
        let multiFactorAuthentication = multiFactorAuthenticationResponse ?
            multiFactorAuthenticationResponse.mfa : undefined;
        return response.json({
            data: {
                mfa: multiFactorAuthentication,
                done: !multiFactorAuthenticationResponse
            }
        });
    });
};
