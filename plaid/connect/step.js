/*
 * Handle Plaid Connect stepConnectUser
 */
 'use strict';

module.exports = function stepConnectUser(request, response, next) {
  let plaid = request.plaid;
  let mfa = request.body.mfa;
  let institution = request.body.institution;
  let plaidAccessToken = request.currentUser.plaid.tokens.connect[institution];

  let error = new Error();
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
  if (typeof mfa !== 'object' || !(mfa.answer || mfa.method)) {
    error.status = 400;
    error.message = 'Missing MFA parameters';
    return next(error);
  }
  
  mfa.method = mfa.method ? {send_method: {type: mfa.method}} : {};
  plaid.client.stepConnectUser(plaidAccessToken, mfa.answer, mfa.method, function(err, mfaRes) {
    if (err) { return next(err); }
    
    return response.json({
      data: {
        mfa: mfaRes ? mfaRes.mfa : undefined,
        done: !mfaRes
      }
    });
  });
};
