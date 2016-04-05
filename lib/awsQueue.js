/**
 * Handles AWS SQS interactions
 */
'use strict';

const aws = require('aws-sdk');
const sqs = new aws.SQS();

sqs.config = new aws.Config({
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
      return reject(e);
    }

    sqs.sendMessage({
      MessageBody: message,
      QueueUrl: params.queue,
      DelaySeconds: params.delay || 0,
    }, function(err, data) {
      if (err) { return reject(err); }

      resolve(data);
    });
  });
}

function receiveMessage(params) {
  params = params || {};
  
  return new Promise((resolve, reject) => {
    sqs.receiveMessage({
      QueueUrl: params.queue,
      WaitTimeSeconds: params.wait || 20
    }, function(err, data) {
      if (err) { return reject(err); }

      resolve(data.Messages);
    });
  });
}