/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
 */

'use strict';

const cluster = require('cluster');
const User = require('../users/user');

module.exports = {

    /**
     * Run workers in order to process all work.
     * @param {number} numberCpus The number of workers this cluster can spawn
     */
    runWith(numberCpus) {

        let people = User.find({ active: true }).toArray((err, people) => {

            if (err) {
                console.log(err);
                return;
            }

            if (!people || people.length === 0) {
                console.log('There is no people information to process');
                return;
            }
        });

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
