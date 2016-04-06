/**
 * Email Mandrill integration
 */
'use strict';

const logger = require('../logger');

// NOTE: this is the default email sender
const EMAIL_SENDER    = 'danny@elmgives.com';

const API_KEY         = process.env.MANDRILL_API_KEY || 'kTuHhDcTRIO4DHq0l6Gjcg';
const mandrill        = require('mandrill-api/mandrill');
const mandrillClient  = new mandrill.Mandrill(API_KEY);

function onSuccess(res, result) {
	res(result);
}

function onError(rej, error) {
	logger.error({ err: error });

	rej('A mandrill error occurred: ' + error.name + ' - ' + error.message);
}

const Mandrill = {

	/**
	 * Just pings Mandriil server.
	 * @returns {Promise<Object>} {PING: 'PONG'} if everything goes OK
	 */
	ping() {

		return new Promise(( res, rej ) => {

			mandrillClient.users.ping2({}, onSuccess.bind(null, res), onError.bind(null, rej));
		});

	},

	/**
	 * List all templates created at Mandrill
	 * @returns {Promise<Array>} return a JSON array with every template detail. This can be used to know the name of the template to use
	 */
	listTemplates() {

		return new Promise(( res, rej ) => {

			mandrillClient.templates.list({}, onSuccess.bind(null, res), onError.bind(null, rej));
		});
	},

	/**
	 * Send a template email to specified recipient
	 * @param   {string}          templateName
	 * @param   {object}          to              An object with at least an email property. Other property is 'name'
	 * @param   {Array}           globalMergeVars If the template has vars then It's an Array with name and content property. Assuming we use handlebars
	 *                                            objects. Example: [{
													"name": "name variable",
													"content": "content of variable"
												 }]
	 * @returns {Promise<object>} Returning value is a JSON object when success
	 */
	send(templateName, to, globalMergeVars) {

		let message = {
			to          : [to],
			'from_email': EMAIL_SENDER,
		};

		if (globalMergeVars && globalMergeVars.length) {
			message['global_merge_vars'] = globalMergeVars;
		}

		return new Promise(( res, rej ) => {

			const options = {
				'template_name'   : templateName,
				'template_content': [],
				message           : message,
			};

			mandrillClient.messages.sendTemplate(options, onSuccess.bind(null, res), onError.bind(null, rej));
		});
	}
};

module.exports = Mandrill;
