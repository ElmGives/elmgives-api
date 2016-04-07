/**
 * Email Mandrill integration
 */
'use strict';

const logger = require('../logger');

const API_KEY         = process.env.MANDRILL_API_KEY || 'kTuHhDcTRIO4DHq0l6Gjcg';
const mandrill        = require('mandrill-api/mandrill');
const mandrillClient  = new mandrill.Mandrill(API_KEY);

function onSuccess(resolve, result) {
	resolve(result);
}

function onError(reject, error) {
	logger.error({ err: error });

	reject('A mandrill error occurred: ' + error.name + ' - ' + error.message);
}

const Mandrill = {

	/**
	 * Just pings Mandriil server.
	 * @returns {Promise<Object>} {PING: 'PONG'} if everything goes OK
	 */
	ping() {

		return new Promise((resolve, reject) => {

			mandrillClient.users.ping2({}, onSuccess.bind(null, resolve), onError.bind(null, reject));
		});

	},

	/**
	 * List all templates created at Mandrill
	 * @returns {Promise<Array>} return a JSON array with every template detail. This can be used to know the name of the template to use
	 */
	listTemplates() {

		return new Promise((resolve, reject) => {

			mandrillClient.templates.list({}, onSuccess.bind(null, resolve), onError.bind(null, reject));
		});
	},

	/**
	 * Send a template email to specified recipient
	 * @param   {string}          templateName
	 * @param   {array}           to              An Array with objects with at least an email property. Other property to use is 'name' inside these objects
	 * @param   {Array}           globalMergeVars If the template has vars then It's an Array with name and content property. Assuming we use handlebars
	 *                                            objects. Example: [{
													"name": "name variable",
													"content": "content of variable"
												 }]
	 * @returns {Promise<object>} Returning value is a JSON object when success
	 */
	send(templateName, to, globalMergeVars) {

		let message = {
			to          : to,
			'from_email': process.env.MANDRILL_EMAIL_SENDER,
		};

		if (globalMergeVars && globalMergeVars.length) {
			message['global_merge_vars'] = globalMergeVars;
		}

		return new Promise((resolve, reject) => {

			const options = {
				'template_name'   : templateName,
				'template_content': [],
				message           : message,
			};

			mandrillClient.messages.sendTemplate(options, onSuccess.bind(null, resolve), onError.bind(null, reject));
		});
	}
};

module.exports = Mandrill;
