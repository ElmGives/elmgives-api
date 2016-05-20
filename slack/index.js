/**
 * Slack module API,
 *
 * Expose required methods to be used
 */
'use strict';

const slack = require('slack');
const prepareData = require('./prepareData');
const TOKEN = process.env.SLACK_TOKEN;
const SLACK_ENABLED = process.env.SLACK_ENABLED;

module.exports = function notify(object, options) {
    options = Object.assign({}, options, {
        token: TOKEN
    });

    if (!SLACK_ENABLED) {
        return Promise.resolve('only send messages on production environment');
    }

    return new Promise((resolve, reject) => {
        slack.chat.postMessage(prepareData(object, options), (error, data) => {
            return error ? reject(error) : resolve(data);
        });
    });
};
