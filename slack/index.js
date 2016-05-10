/**
 * Slack module API,
 *
 * Expose required methods to be used
 */
'use strict';

const slack = require('slack');
const prepareData = require('./prepareData');
const TOKEN = process.env.SLACK_TOKEN;

function notify(object) {
    const data = prepareData(data, TOKEN);

    return new Promise((resolve, reject) => {
        slack.chat.postMessage(data, (error, data) => {
            return error ? reject(error) : resolve(data);
        });
    });
}

module.exports = notify;
