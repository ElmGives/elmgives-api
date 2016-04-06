/*
 * Handle Plaid Connect getConnectUser
 */
 'use strict';

module.exports = function getConnectUser(request, response, next) {
  let plaid = request.plaid;
  let institution = request.query.institution;
  let lte = request.query.lte;
  let gte = request.query.gte;

  let error = new Error();
  if (!institution) {
    error.status = 400;
    error.message = 'Missing institution type';
    return next(error);
  }

  let plaidAccessToken = request.currentUser.plaid.tokens.connect[institution];
  if (!plaidAccessToken) {
    error.status = 400;
    error.message = 'Missing Plaid access token. Please obtain one and try again.';
    return next(error);
  }

  plaid.client.getConnectUser(plaidAccessToken, {
    lte: lte,
    gte: gte
  }, function(err, res) {
    if (err) { return next(err); }

    response.json({
      data: res
    });
  });
};
