/**
 * Middleware to upload images to parse multipart form and upload them to S3
 */
'use strict';

const formidable = require('formidable');
const upload = require('./upload');

function parseForm(request, response, next) {

    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.maxFields = 0;
    form.keepExtensions = true;
    form.onError = next;

    form.onPart = function(part) {
        if (!part.filename) {
            // Handle non file parts
            return this.handlePart(part);
        }

        console.log('part', part);
        upload(part);
    };


    form.parse(request);
}

module.exports = parseForm;
