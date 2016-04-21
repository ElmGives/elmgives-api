/**
 * Upload images to S3
 */
'use strict';

/**
 * @see https://github.com/aws/aws-sdk-js
 */
let AWS = require('aws-sdk');

/**
 * @see  https://github.com/aws/aws-sdk-js/
 */
AWS.config.setPromisesDependency(Promise);

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
 * image = multiparty 'part'
 */
module.exports = function upload(image) {
    let object = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${image.name}/${image.filename}`,
        ACL: 'public-read',
        Body: image,
        ContentLength: image.byteCount,
        ContentType: image.headers['content-type']
    };

    if (!image.name || !availableFolders[image.name]) {
        let error = new Error();
        error.message = 'Field name is required';

        return Promise.reject(error);
    }

    return s3.putObject(object).promise();
};
