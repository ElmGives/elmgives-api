/**
 * Upload images to S3
 */
'use strict';

let AWS = require('aws-sdk');
let s3 = new AWS.S3();

let object = {
    Bucket: process.env.BUCKET
};

module.exports = function upload(image) {
    object.ContentType = image.headers['content-type'];
    object.Key = image.filename;

    return new Promise((resolve, reject) => {
        s3.client.putObject(object, (error, data) => {
            return error ? reject(error) : resolve(data);
        });
    });
};
