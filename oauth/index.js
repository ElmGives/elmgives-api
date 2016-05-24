/**
 * Manage Plaid API
 */
'use strict';

const router = require('express').Router();
const logger = require('../logger');
const stripeOAuth = require('./stripe');

/* Stripe client*/
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
/* Since no charges can be made to users on behalf of NPOs (core service) without
   properly setting up a Stripe client, continuing without it is not an option */
if (String(process.env.NODE_ENV).match(/production/i) && stripeSecretKey.indexOf('sk_') < 0) {
    let error = new Error('Stripe secret key is missing.');
    logger.error({err: error});
    throw error;
}
const stripe = require('stripe')(stripeSecretKey);

function stripeClient(request, response, next) {
    request.stripe = stripe;
    return next();
}

router
    .use(stripeClient)
    .use(stripeOAuth);

module.exports = router;
