/**
 * Middleware to upload images to parse multipart form and upload them to S3
 */
'use strict';

/**
 * Using multiparty instead of formidable to stream directly to S3
 * @see  https://github.com/andrewrk/node-multiparty
 */
const multiparty = require('multiparty');
const upload = require('./upload');

function parseForm(request, response, next) {
    var form = new multiparty.Form({
        autoFields: true
    });

    form.on('error', (error) => {
        return next(error);
    });

    form.on('aborted', (error) => {
        return next(error);
    });

    form.on('part', function(part) {

        if (!part.filename) {
            return console.log(' no file name');
        }

        upload(part)
            .then(() => {
                return response.json({
                    data: [`${part.name}/${part.filename}`]
                });
            })
            .catch(next);
    });

    form.parse(request);
}

module.exports = parseForm;
