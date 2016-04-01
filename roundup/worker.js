/**
 * Queries PLAID servers for user account information in order to round up the sum to donate to NOPs
 */

'use strict';

const querystring = require('querystring');
const https = require('https');
const create = require('../transactions/create');

const PLAID_SERVER = process.env.PLAID_ENV || 'tartan.plaid.com';

const yesterdate = new Date(Date.now() - (1000 * 60 * 60 * 24));
const YESTERDAY = `${yesterdate.getFullYear()}-${padNumber(yesterdate.getMonth() + 1)}-${padNumber(yesterdate.getDate())}`;

const options = {
    host: PLAID_SERVER,
    method: 'POST',
    path: '/connect/get',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

function padNumber(number) {
  return (number < 10) ? `0${number}` : `${number}`;
}

module.exports = {

    /**
     * Add eventListener to supervisor in order to request information to Plaid with userData sent by
     * supervisor
     */
    init() {

        process.on('message', (msg) => {

            if (msg === 'finish') {
                process.exit(0);
                return;
            }

            this.request(msg);
        });
        process.send('ready');
    },

    /**
     * Sends an https request to plaid requesting user history data
     * @param {object} personData Its needed personID, along with person plaid access token
     */
    request(personData) {

        const postData = querystring.stringify({
            'client_id'   : process.env.PLAID_CLIENTID || 'test_id',
            'secret'      : process.env.PLAID_SECRET || 'test_secret',
            'access_token': personData.token,
            'options'     : {
              'gte':  YESTERDAY;
            }
        });

        let req = https.request(options, function (res) {
            // TODO: Remove headers log when accepted
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

                this.processData(this.result, personData);
                this.result = '';

                process.send('ready');
            });
        }.bind(this));

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(postData);
        req.end();
    },

    /**
     * We take the transactions array from plaid and filter out those that we don't need and that are not pending.
     * On the remaining data, we round up and save this new transaction
     * @param {object}  data       The response from Plaid
     * @param {object} personData User information
     */
    processData(data, personData) {

        // From the JSON received by Plaid we find useful the types 'place' and 'digital'
        // because they are what we are ineterested in
        JSON.parse(data).transactions
            .filter(transaction => {
                return (transaction.type.primary === 'place' || transaction.type.primary === 'digital') &&  (transaction.pending === false);
            })
            .forEach(transaction => {
                let roundup = this.roundup(transaction.amount);

                this.save({
                    transactionId: transaction._id,
                    userId: personData._id,
                    amount: transaction.amount,
                    roundup: roundup,
                    date: transaction.date,
                    name:  transaction.name,
                    summed: false,    // This one is to know if we have already ran the process on this transaction
                });
            });
    },

    /**
     * We receive the amount and use multiplication because the way Javascript handles float point arithmetic
     * @param   {number|string} amount The amount to be rounded up
     * @returns {number}
     */
    roundup(amount) {
        // This is necessary because JavaScript float point arithmetic
        let number  = parseFloat(amount);
        let ceil    = Math.ceil(number);
        let hundred = (ceil * 100 ) - (number * 100);

        return hundred / 100;
    },

    /**
     * We pass transaction to be saved on DB
     * @param {object} transaction
     */
    save(transaction) {
       create(transaction);
    },
};
