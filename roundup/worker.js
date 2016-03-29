/**
 * Queries PLAID servers for user account information in order to round up the sum to donate to NOPs
 */

'use strict';

const querystring = require('querystring');
const https = require('https');

const TEST_SERVER = 'tartan.plaid.com';

const options = {
    host: TEST_SERVER,
    method: 'POST',
    path: '/connect/get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

module.exports = {

    init() {

        process.on('message', (personData) => {

            this.request(personData);

            console.log('message received from cluster', personData);
        });

        process.send('ready');
    },

    request(personData) {

        const postData = querystring.stringify({
            'client_id'   : process.env.PLAID_CLIENTID || 'test_id',
            'secret'      : process.env.PLAID_SECRET || 'test_secret',
            'access_token': personData.token,        // TODO: change for what is final on DB
        });

        let req = https.request(options, function (res) {
//            console.log(`STATUS: ${res.statusCode}`);
//            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.setEncoding('utf8');

            res.on('data', chunk => this.result = chunk);

            res.on('end', () => {

                if (res.statusCode !== 200) {
                    console.log('There was an error');
                    console.log(this.result);

                    this.result = '';
                    return;
                }

                // From the JSON received by Plaid we find useful the types 'place' and 'digital'
                // because they are what we are ineterested in
                JSON.parse(this.result).transactions
                    .filter(transaction => transaction.type.primary === 'place' || transaction.type.primary === 'digital')
                    .forEach(transaction => {

                        // This is necessary because float point arithmetic
                        let number  = parseFloat(transaction.amount);
                        let ceil    = Math.ceil(number);
                        let hundred = (ceil * 100 ) - (number * 100);
                        let rounded = hundred / 100;

                        console.log(`Amount: ${transaction.amount}, Rounded: ${rounded}, Subs: ${ceil - number}`);
                    });

                this.result = '';

                process.exit(0);
//                process.send('I finished');
            });
        }.bind(this));

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(postData);
        req.end();
    },
};
