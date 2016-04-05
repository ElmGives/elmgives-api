/**
 * Email Mandrill integration
 */
'use strict';

const API_KEY         = process.env.MANDRILL_API_KEY || 'kTuHhDcTRIO4DHq0l6Gjcg';
const EMAIL_SENDER    = 'danny@elmgives.com';

const mandrill        = require('mandrill-api/mandrill');
const mandrillClient  = new mandrill.Mandrill(API_KEY);

function onSuccess( res, result ) {
	res( result );
}

function onError( rej, e ) {
	rej('A mandrill error occurred: ' + e.name + ' - ' + e.message);
}

module.exports = {

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

			mandrillClient.messages.sendTemplate({
				'template_name': templateName,
				message        : message,
			}, onSuccess.bind(null, res), onError.bind(null, rej));
		});
	}
};
