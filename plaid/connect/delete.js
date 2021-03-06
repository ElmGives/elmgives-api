/*
 * Handle Plaid Connect deleteConnectUser
 */
 'use strict';

module.exports = function deleteConnectUser(request, response, next) {
    let plaid = request.plaid;
    let institution = request.body.institution;
    let plaidAccessToken;
    let error = new Error();

    if (!institution) {
        error.status = 400;
        error.message = 'Missing institution type';
        return next(error);
    }

    try {
        plaidAccessToken = request.currentUser.plaid.tokens.connect[institution];
    } catch (serverError) {
        error.status = 422;
        error.message = 'error from server';
        return next(error);
    }

    if (!plaidAccessToken) {
        error.status = 400;
        error.message = 'Missing Plaid access token. Please obtain one and try again.';
        return next(error);
    }

    plaid.client.deleteConnectUser(plaidAccessToken, {
        /* options */
    }, function(plaidError, plaidResponse) {
        if (plaidError) {
            error.status = plaidError.statusCode || 400;
            error.message = plaidError.message || plaidError.resolve || 'plaid-connect-error';
            return next(error);
        }

        response.json({
            data: plaidResponse
        });
    });
};
