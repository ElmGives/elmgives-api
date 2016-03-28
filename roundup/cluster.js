/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
 */

'use strict';

const cluster = require('cluster');

module.exports = {

    runWith(numberCpus) {

        for (let i = 0; i < numberCpus; i += 1) {
            let worker = cluster.fork();

            worker.on('exit', () => {

                console.log(cluster.workers)

                // TODO: Test there is no more work to do before ending
                if (Object.keys(cluster.workers).length == 0) {
                    console.log('There are no workers left');
                    process.exit(0);
                }
            });
        }
    },
};
