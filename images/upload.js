/**
 * Upload images to S3
 */
'use strict';

let AWS = require('aws-sdk');

let s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET,
    ACL: process.env.AWS_S3_ACL
});

/**
 * Submit form input should be named as defined on this availableFolders
 * That's our way to upload content to specific folder on S3
 */
let availableFolders = {
    posts: 'posts',
    logos: 'logos'
};

/**
 * image = formidable 'part'
 */
module.exports = function upload(image) {
    let object = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${image.name}/${image.filename}`,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {

        if (!image.name || !availableFolders[image.name]) {
            let error = new Error();
            error.message = 'Field name is required';
            return reject(error);
        }

        s3.putObject(object, (error, data) => {
            return error ? reject(error) : resolve(data);
        });
    });
};
