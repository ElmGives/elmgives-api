/**
 * Manage Plaid Link flow
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../../lib/verifyJwt');
const authenticate = require('../../lib/authenticate');
const currentUser = require('../../lib/currentUser');

const PATH = '/plaid/institutions';

function getInstitutions (request, response, next) {
  let plaid = request.plaid;
  plaid.getInstitutions(plaid.environments.production, function(err, res) {
    if (err) { return next(err); }

    response.json({
      data: res
    });
  });
}

router
    .get(PATH, verifyToken, authenticate, currentUser, getInstitutions);

module.exports = router;
