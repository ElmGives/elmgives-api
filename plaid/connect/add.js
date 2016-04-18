/*
 * Handle Plaid Connect addConnectUser
 */
 'use strict';

const Bank = require('../../banks/bank');

module.exports = function addConnectUser(request, response, next) {
    let plaid = request.plaid;
    let username = request.body.username;
    let password = request.body.password;
    let institution = request.body.institution;
    let query = {type: institution};
    let error = new Error();
    let accessToken;

    if (!username || !password) {
        error.status = 400;
        error.message = 'Missing username or password';
        return next(error);
    }
    if (!institution) {
        error.status = 400;
        error.message = 'Missing institution type';
        return next(error);
    }

    Bank
        .findOne(query)
        .then(function(bank) {
            if (!bank) {
                error.status = 400;
                error.message = 'Invalid institution type';
                return next(error);
            }

            request.bankData = bank;
            return bank;
        })
        .then(bank => {
            const settings = {
                username: username,
                password: password,
            };

            const options = {
                list: true,
            };
            
            return new Promise((resolve, reject) => {
                plaid.client.addConnectUser(bank.type, settings, options,
                    (plaidError, multiFactorAuthenticationResponse, plaidResponse) => {
                    if (plaidError) {
                        error.status = plaidError.statusCode || 400;
                        error.message = plaidError.message || plaidError.resolve || 'plaid-connect-error';
                        return next(error);
                    }
                    return resolve(multiFactorAuthenticationResponse || plaidResponse);
                });
            });
        })
        .then(multiFactorAuthenticationResponse => {
            /*jshint camelcase: false */
            accessToken = multiFactorAuthenticationResponse.access_token;

            let query = {};
            query['plaid.tokens.connect.' + request.bankData.type] = accessToken;

            let multiFactorAuthentication = multiFactorAuthenticationResponse ?
                multiFactorAuthenticationResponse.mfa : undefined;
            // request.multiFactorAuthentication = multiFactorAuthentication;

            return request.currentUser.update(query)
                .then(() => multiFactorAuthentication);
        })
        .then(multiFactorAuthentication => {
            /*jshint camelcase: false */
            response.json({
                data: {
                    mfa: multiFactorAuthentication,
                    access_token: accessToken
                }
            });
        })
        .catch(next);
};
