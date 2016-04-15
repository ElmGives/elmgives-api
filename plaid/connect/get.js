/*
 * Handle Plaid Connect getConnectUser
 */
 'use strict';

module.exports = function getConnectUser(request, response, next) {
    let plaid = request.plaid;
    let institution = request.query.institution;
    let lowerThanOrEqual = request.query.lte;
    let greaterThanOrEqual = request.query.gte;
    let plaidAccessToken;
    let error = new Error();

    if (!institution) {
        error.status = 400;
        error.message = 'Missing institution type';
        return next(error);
    }

    try {
        plaidAccessToken = request.currentUser.plaid.tokens.connect[institution];
    } catch (err) {
        error.status = 422;
        error.message = 'error from server';
        return next(error);
    }

    if (!plaidAccessToken) {
        error.status = 400;
        error.message = 'Missing Plaid access token. Please obtain one and try again.';
        return next(error);
    }

    plaid.client.getConnectUser(plaidAccessToken, {
        lte: lowerThanOrEqual,
        gte: greaterThanOrEqual
    }, function(error, res) {
        if (error) { return next(error); }

        response.json({
            data: res
        });
    });
};
