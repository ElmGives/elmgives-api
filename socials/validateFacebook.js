/**
 * Validate facebook information provided from social authentication from
 * client app
 */
'use strict';

const https = require('https');
const url = 'https://graph.facebook.com/me?fields=email&access_token=';

module.exports = function valdiateFacebook(token) {

    if (!token) {
        let error = new Error();
        error.status = 422;
        error.message = 'Token required';

        return Promise.reject(error);
    }

    https.get(url + token, function(res) {
        var string = '';

        res.on('data', function(chunk) {
            string += chunk;
        });

        res.on('error', Promise.reject);

        res.on('end', function() {
            var response = JSON.parse(string);
            Promise.resolve(!!response.id);
        });
    }).end();
};
