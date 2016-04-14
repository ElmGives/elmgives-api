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
        if (err) { return next(err); }
        /* Store access_token */



        /* jshint camelcase: false */
        let accessToken = (mfaRes || res).access_token;
        let query = {};
        query['plaid.tokens.connect.' + bank.type] = accessToken;
        request.currentUser.update(query)
          .then(function () {
            response.json({
              data: {
                mfa: mfaRes ? mfaRes.mfa : undefined,
                access_token: accessToken
              }
            });
          })
          .catch(next);
      });
    })
    .catch(next);
};
