/**
 * Verify which environment variables are required to start the application
 */

'use strict';
const logger = require('../logger');
const slack = require('../slack');

/**
 * Since some of the values here are not required for development, we must check
 * for production environment
 */

let variables = process.env;
const PRODUCTION = 'production';

let required = [
    'DB_USER',
    'DB_PASS',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'EXPIRE_HOURS',
    'PLAID_CLIENTID',
    'PLAID_SECRET',
    'PLAID_ENV',
    'AWS_SQS_REGION',
    'AWS_SQS_ACCESS',
    'AWS_SQS_SECRET',
    'AWS_SQS_URL_TO_SIGNER',
    'AWS_SQS_URL_FROM_SIGNER',
    'JWT_SECRET',
    'AWS_S3_KEY',
    'AWS_S3_SECRET',
    'AWS_S3_REGION',
    'AWS_S3_ACL',
    'MANDRILL_API_KEY',
    'MANDRILL_EMAIL_SENDER',
    'MANDRILL_VERIFY_ACCOUNT',
    'SERVER_KID',
    'SERVER_PRIVATE_KEY',
    'CLIENT_URL',
    'MANDRILL_VERIFY_ACCOUNT_EMAIL_TEMPLATE',
    'MANDRILL_RECOVERY_PASSWORD_EMAIL_TEMPLATE',
    'SLACK_TOKEN',
    'SLACK_MESSAGES'
];

let notFound = required.filter(option => {
    return !variables[option];
});

if (!notFound.length) {
    return logger.info('ENVIRONMENT OK');
}

let error = new Error();
error.message = 'required variables: \n' + notFound.join('\n');

logger.error({
    err: error
});

if (process.env.NODE_ENV === PRODUCTION) {
    slack(error)
        .then(data => logger.info(data))
        .catch(error => logger.error(error));

    throw error;
}
