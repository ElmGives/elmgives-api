'use strict';

const email  = require('./mandrill');
const logger = require('../logger');

// NOTE: Write your email address to receive the test mail
const TEST_RECIPIENT  = 'mail@service.provider.com';

const TO = [{
	email: TEST_RECIPIENT,
}];

const MAIL_HANDLEBARS_VARS = [{
	name   : 'testVars',
	content: 'Test content',
}];

const TEMPLATE_NAME = 'testtemplateone';

// In this test:
// First list templates in Mandrill
// Then it shows them on console
// Then we try to send an email testing handlebars inside the template
// Then show Mandrill confirmation JSON object
// Then try to send the same email without vars to see differences
// Then show Mandrill confirmation JSON object
// Then exist the app if everything is OK.
email.listTemplates()
	.then(msg => logger.info(msg))
	.then(() => email.send(TEMPLATE_NAME, TO, MAIL_HANDLEBARS_VARS))
	.then(msg => logger.info(msg))
    .then(() => email.send(TEMPLATE_NAME, TO))
    .then(msg => logger.info(msg))
	.then(() => process.exit(0))
	.catch(err => logger.info(err));
