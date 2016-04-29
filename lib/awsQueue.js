/**
 * Handles Amazon Web Services SimpleQueueService interactions
 */
'use strict';

const amazonWebServices = require('aws-sdk');
const simpleQueueService = new amazonWebServices.SQS();
const stringify = require('json-stable-stringify');

simpleQueueService.config = new amazonWebServices.Config({
    region: process.env.AWS_SQS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SQS_ACCESS,
        secretAccessKey: process.env.AWS_SQS_SECRET
    }
});

module.exports = {
    sendMessage: sendMessage,
    receiveMessage: receiveMessage,
    deleteMessage: deleteMessage
};

function sendMessage(message, params) {
    params = params || {};

    return new Promise((resolve, reject) => {
        try {
            message = (typeof message === 'string') ? message : stringify(message);
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

function deleteMessage(handle, queue) {

    return new Promise(( resolve, reject ) => {

        if (!handle) {
            return Promise.reject(new Error('There is not handle present to send to AWS'));
        }

        if (!queue) {
            return Promise.reject(new Error('Queue should be present'));
        }

        simpleQueueService.deleteMessage({
            QueueUrl: queue,
            ReceiptHandle: handle,
        }, function (error, data) {
            return error ? reject(error) : resolve(data);
        });
    });

}
