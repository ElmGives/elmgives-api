/*
 * Handle Plaid Link exchange public token
 */
 'use strict';

const Bank = require('../../banks/bank');

module.exports = function patchConnectUser(request, response, next) {
  let plaid = request.plaid;
  let publicToken = request.body.public_token;
  let accountID = request.body.account_id;
  let institution = request.body.institution;

  let error = new Error();
  if (!publicToken) {
    error.status = 400;
    error.message = 'Missing public_token';
    return next(error);
  }
  if (!institution) {
    error.status = 400;
    error.message = 'Missing institution type';
    return next(error);
  }

  Bank.findOne({type: institution})
    .then(function (bank) {
      if (!bank) {
        error.status = 400;
        error.message = 'Invalid institution type';
        return next(error);
      }

      plaid.client.exchangeToken(publicToken, accountID, function (err, res) {
        if (err) return next(err);

        let accessToken = res.access_token;
        let stripeToken = res.stripe_bank_account_token;
        if (!accessToken) {
          error.status = 500;
          error.message = 'Access token could not be retrieved';
          return next(error);
        }

        let query = {};
        query['plaid.tokens.connect.' + bank.type] = accessToken;
        query['stripe.token'] = stripeToken;
        request.currentUser.update(query)
          .then(function () {
            response.json({
              data: {
                access_token: accessToken,
                stripe_token: stripeToken
              }
            })
          })
          .catch(next);
      });
    });
}
