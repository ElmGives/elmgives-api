/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
 */

'use strict';

const cluster = require('cluster');

module.exports = {

    /**
     * Run workers in order to process all work.
     * @param {number} numberCpus The number of workers this cluster can spawn
     */
    runWith(numberCpus) {

        for (let i = 0; i < numberCpus; i += 1) {
            let worker = cluster.fork();

            worker.on('exit', () => {

                // TODO: query all active users with plaid access token
                // TODO: Test there is no more work to do before ending
                // TODO: When ending all work, test if it's time to run sum up process on all transactions. For this, users need to have Stripe access token
                if (Object.keys(cluster.workers).length === 0) {
                    console.log('There are no workers left');
                    process.exit(0);
                }
            });

            worker.on('message', (msg) => {

                if (msg === 'ready') {
                    worker.send({ token: 'test_wells' });
                }
            });
        }
    },
};
