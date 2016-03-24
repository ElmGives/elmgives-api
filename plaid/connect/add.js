/*
 * Handle Plaid Connect addConnectUser
 */
 'use strict';

const Bank = require('../../banks/bank')

module.exports = function addConnectUser(request, response, next) {
  let plaid = request.plaid;
  let username = request.body.username;
  let password = request.body.password;
  let institution = request.body.institution;

  let error = new Error();
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

  Bank.findOne({type: institution})
    .then(function (bank) {
      if (!bank) {
        error.status = 400;
        error.message = 'Invalid institution type';
        return next(error);
      }

      plaid.client.addConnectUser(bank.type, {
        username: username,
        password: password,
      }, {
          list: true,
      }, function(err, mfaRes, res) {
        if (err) return next(err);

        /* Return MFA options to the client */
        if (mfaRes) {
          return response.json({
            data: {
              mfa: mfaRes.mfa
            }
          });
        }

        /* Store access_token */
        request.currentUser.update({'plaid.tokens.connect': res.access_token})
          .then(function () {
            response.json({
              data: {
                access_token: res.access_token
              }
            })
          });
      });
    })
    .catch(next);
}
