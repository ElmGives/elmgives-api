'use strict';
/*jshint camelcase: false */

const tape = require('tape');
const sinon = require('sinon');

const PlaidLinkExchanger = require('../../../plaid/link/exchange');

let user = {
    name: 'userName',
    email: 'user@example.com'
};
let customer = {
    id: 'customerID',
    sources: {
        data: [{}]
    }
};
let tokens = {
    stripe: 'stripeBankAccountToken',
    plaid: 'plaidPublicToken',
    access: 'plaidAccessToken'
};
let accountID = 'stripeBankAccountID';

sinon.stub(PlaidLinkExchanger.stripe.customers, 'create').returns(Promise.resolve(customer));
let plaid = {
    client: {
        exchangeToken: sinon.stub()
    }
};

tape('Exchange Plaid Public Token (methods)', test => {
    test.plan(13);

    PlaidLinkExchanger.createStripeCustomer(user, tokens.stripe).then(createdCustomer => {     
        let params = PlaidLinkExchanger.stripe.customers.create.getCall(0).args[0];

        test.equal(params.email, user.email,
            `createStripeCustomer is called with email ${user.email}`);
        test.equal(params.description, user.name,
            `createStripeCustomer is called with user ${user.name}`);
        test.equal(params.source, tokens.stripe,
            `createStripeCustomer is called with stripe token ${tokens.stripe}`);

        test.equal(createdCustomer.id, customer.id,
            `createStripeCustomer returns a customer with ID ${customer.id}`);
    });

    PlaidLinkExchanger.stripe.customers.create.returns(Promise.resolve({sources:{}}));
    PlaidLinkExchanger.createStripeCustomer(user, tokens.stripe)
        .then(() => test.fail('did not reject on failed Stripe customer creation'))
        .catch(error => {     
            test.equal(error instanceof Error, true, 'rejects on failed Stripe customer creation');
        });

    plaid.client.exchangeToken = sinon.stub();
    PlaidLinkExchanger.exchangePublicToken(plaid, tokens.plaid, accountID).then(createdCustomer => {     
        let plaidArgs = plaid.client.exchangeToken.getCall(0).args;
        test.equal(plaidArgs[0], tokens.plaid,
            `exchangeToken is called with token ${tokens.plaid}`);
        test.equal(plaidArgs[1], accountID,
            `exchangeToken is called with account ID ${accountID}`);
        test.equal(typeof plaidArgs[2], 'function',
            'exchangePublicToken is called with a callback function');
        test.equal(createdCustomer.plaidAccessToken, tokens.access,
            `exchangePublicToken returns access token ${tokens.access}`);
        test.equal(createdCustomer.stripeBankAccountToken, tokens.stripe,
            `exchangePublicToken returns stripe token ${tokens.stripe}`);
    });
    plaid.client.exchangeToken.callArgWith(2, null, {
        access_token: tokens.access,
        stripe_bank_account_token: tokens.stripe
    });

    plaid.client.exchangeToken = sinon.stub();
    PlaidLinkExchanger.exchangePublicToken(plaid, tokens.plaid, accountID)
        .then(() => test.fail('did not reject on Plaid API error'))
        .catch(error => {     
            test.equal(error.message, 'plaid-api-error', 'exchangeToken rejects on Plaid API error');
        });
    plaid.client.exchangeToken.callArgWith(2, {
        message: 'plaid-api-error',
    });

    plaid.client.exchangeToken = sinon.stub();
    PlaidLinkExchanger.exchangePublicToken(plaid, tokens.plaid, accountID)
        .then(() => test.fail('did not reject on missing Plaid access token'))
        .catch(error => {     
            test.equal(error.message, 'Access token could not be retrieved',
                'exchangeToken rejects on missing Plaid access token');
        });
    plaid.client.exchangeToken.callArgWith(2, null, {
        access_token: false
    });

    plaid.client.exchangeToken = sinon.stub();
    PlaidLinkExchanger.exchangePublicToken(plaid, tokens.plaid, accountID)
        .then(() => test.fail('did not reject on missing Stripe bank account token'))
        .catch(error => {     
            test.equal(error.message, 'Stripe token could not be retrieved',
                'exchangeToken rejects on missing Stripe bank account token');
        });
    plaid.client.exchangeToken.callArgWith(2, null, {
        access_token: true,
        stripe_bank_account_token: false
    }); 
});
