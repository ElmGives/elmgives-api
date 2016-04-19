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
    plaid.getInstitutions(process.env.PLAID_ENV, function(error, plaidResponse) {
        if (error) {
            return next(error);
        }

        response.json({
            data: plaidResponse
        });
    });
}

router
    .get(PATH, verifyToken, authenticate, currentUser, getInstitutions);

module.exports = router;
