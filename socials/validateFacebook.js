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

    return new Promise((resolve, reject) => {

        /**
         * TODO:
         *     Improve this request using another library or solution to deal
         *     with json responses
         */
        https.get(`${url}${token}`, function(response) {
            var string = '';

            response.on('data', function(chunk) {
                string += chunk;
            });

            response.on('error', Promise.reject);

            response.on('end', function() {
                var response = JSON.parse(string);
                resolve(!!response.id);
            });
        }).end();
    });
};
