/**
 * Email Mandrill integration
 * Using this module:
 *
 * const email = require(' path to this file');
 *
 * const templateName = 'tempalte name provided from Mandrill';
 * const to = [{email: 'foobar@foo.com'}];
 * const globalVars = [{name: 'defined name on mandrill', content: 'var value'}]
 *
 * email.send(templateName, to, globalVars)
 *     .then(sent => console.log(sent))
 *     .catch(error => console.log(error))
 */
'use strict';

/**
 * @see https://mandrillapp.com/api/docs/index.nodejs.html
 */
const mandrill = require('mandrill-api/mandrill');
const API_KEY = process.env.MANDRILL_API_KEY;

const mandrillClient = new mandrill.Mandrill(API_KEY);
const MANDRILL_EMAIL_SENDER = process.env.MANDRILL_EMAIL_SENDER;

const Mandrill = {

    /**
     * Just pings Mandriil server.
     * @returns {Promise<Object>} {PING: 'PONG'} if everything goes OK
     */
    ping() {
        return new Promise((resolve, reject) => {
            mandrillClient.users.ping2({}, resolve, reject);
        });

    },

    /**
     * List all templates created at Mandrill
     * @returns {Promise<Array>} return a JSON array with every template detail.
     * This can be used to know the name of the template to use
     */
    listTemplates() {
        return new Promise((resolve, reject) => {
            mandrillClient.templates.list({}, resolve, reject);
        });
    },

    /**
     * Method to send email using Mandrill Templates
     *     templateName = 'value from Mandrill template'
     *     to = Array of recipients
     *     subject = subject line of email
     *     globalMergeVars = array of objects like: [{name: '', content: ''}]
     * More about globalMergeVars
     * https://mandrillapp.com/api/docs/messages.nodejs.html#method=send-template
     *
     * This method returns a Promise instance
     */
    send(templateName, to, subject, globalMergeVars) {

        const options = {
            'template_name': templateName,
            'template_content': [],
            message: {
                to: to,
                'from_name' : 'Elm',
                'from_email': MANDRILL_EMAIL_SENDER,
                'global_merge_vars': globalMergeVars || []
            },
        };

        return new Promise((resolve, reject) => {
            mandrillClient.messages.sendTemplate(options, resolve, reject);
        });
    }
};

module.exports = Mandrill;
