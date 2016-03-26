/*
 * Handle Plaid Link exchange public token
 */
 'use strict';

const Bank = require('../../banks/bank');

module.exports = function patchConnectUser(request, response, next) {
  let plaid = request.plaid;
  let publicToken = request.body.public_token;
  let accountID = request.body.request_id;
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

      plaid.client.exchangeToken(publicToken, function (err, res) {
        if (err) return next(err);

        let accessToken = res.access_token;
        if (!accessToken) {
          error.status = 500;
          error.message = 'Access token could not be retrieved';
          return next(error);
        }

        let query = {};
        query['plaid.tokens.connect.' + bank.type] = accessToken;
        request.currentUser.update(query)
          .then(function () {
            response.json({
              data: {
                access_token: accessToken
              }
            })
          })
          .catch(next);
      });
    });
}
