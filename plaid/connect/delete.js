/*
 * Handle Plaid Connect deleteConnectUser
 */
 'use strict';

module.exports = function deleteConnectUser(request, response, next) {
  let plaid = request.plaid;
  let institution = request.body.institution;

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

  plaid.client.deleteConnectUser(plaidAccessToken, {

  }, function(err, res) {
    if (err) return next(err);

    response.json({
      data: res
    })
  });
}
