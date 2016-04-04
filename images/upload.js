/**
 * Upload images to S3
 */
'use strict';

let AWS = require('aws-sdk');

let s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET,
    ACL: 'public-read'
});

/**
 * image = formidable 'part'
 */
module.exports = function upload(image) {
    let object = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: image.filename
            // object.ContentType = image.headers['content-type'];
    };

    return new Promise((resolve, reject) => {
        s3.putObject(object, (error, data) => {
            console.log('on put content', error, data);
            return error ? reject(error) : resolve(data);
        });
    });
};
