/**
 * Handles Amazon Web Services SimpleQueueService interactions
 */
'use strict';

const amazonWebServices = require('aws-sdk');
const simpleQueueService = new amazonWebServices.SQS();

simpleQueueService.config = new amazonWebServices.Config({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SECRET
    }
});

module.exports = {
    sendMessage: sendMessage,
    receiveMessage: receiveMessage
};

function sendMessage(message, params) {
    params = params || {};

    return new Promise((resolve, reject) => {
        try {
            message = (typeof message === 'string') ? message : JSON.stringify(message);
        } catch (e) {
            return reject(e);    
        }
        if (!message) {
            return reject(new Error('no-message'));
        }

        simpleQueueService.sendMessage({
            MessageBody: message,
            QueueUrl: params.queue,
            DelaySeconds: params.delay || 0,
        }, function(error, data) {
            return error ? reject(error) : resolve(data);
        });
    });
}

function receiveMessage(params) {
    params = params || {};
    
    return new Promise((resolve, reject) => {
        simpleQueueService.receiveMessage({
            QueueUrl: params.queue,
            WaitTimeSeconds: params.wait || 20 // 20 is the maximum number of seconds for long polling
        }, function(error, data) {
            return error ? reject(error) : resolve(data.Messages || []);
        });
    });
}
