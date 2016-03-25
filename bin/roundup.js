
const cluster = require('cluster');
const https = require('https');
const querystring = require('querystring');
const numCPUs = require('os').cpus().length;

const Cluster = {

    accounts: 1,

    init() {
        'use strict';

        console.log('Start process', Date.now());

        // For this demo we are going to use three cores
        for (let i = 0; i < numCPUs; i += 1) {
            let worker = cluster.fork();

            worker.send('start to work ' + worker.id + ' iteratoin ' + this.accounts);
            this.accounts += 1;

            worker.on('message', function(msg) {
                console.log(msg, worker.id );

                if ( this.accounts < 1000 ) {
                    worker.send('start to work ' + worker.id + ' iteration ' + this.accounts);
                    this.accounts += 1;
                }
                else {
                    console.log('END PROCESS', Date.now());
                }
            }.bind( this ));
        }
    },
};

const Worker = {

    result: '',

    request() {
        'use strict';

        const opts = {
            host: 'tartan.plaid.com',
            method: 'POST',
            path: '/connect',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const postData = querystring.stringify({
            'client_id' : 'test_id',
            'secret'    : 'test_secret',
            'username'  : 'plaid_test',
            'password'  : 'plaid_good',
            'type'      : 'wells',
        });

        let req = https.request(opts, function (res) {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.setEncoding('utf8');

            res.on('data', chunk => this.result += chunk);

            res.on('end', () => {
                console.log('No more data in response.');

                // From the JSON received by Plaid we find useful the types 'place' and 'digital'
                // because they are what we are ineterested in
                JSON.parse( this.result ).transactions
                    .filter( transaction => transaction.type.primary === 'place' || transaction.type.primary === 'digital' )
                    .forEach( transaction => console.log( transaction.amount ));

                console.log(`End worker ${ this.id }: `, Date.now() );

                this.result = '';

                process.send('I finished');
            });
        }.bind( this ));

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(postData);
        req.end();

        console.log(`Start worker ${ this.id }: `, Date.now() );
    },
};

if ( cluster.isMaster ) {
    Cluster.init();
}
else {
    var worker = Object.create( Worker );
    worker.id = process.pid;

    process.on('message', function (msg) {
        'use strict';

        console.log(msg);
        worker.request();
    });
}
