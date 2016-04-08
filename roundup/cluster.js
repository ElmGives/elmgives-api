/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
 */

'use strict';

const cluster = require('cluster');
const User    = require('../users/user');
const logger  = require('../logger');

const Cluster = {

    /**
     * Run [numberCpus] workers in order to process all work.
     * @param {number} numberCpus The number of workers this cluster can spawn
     */
    runWith(numberCpus) {

        const query = {
            active                : true,
            plaid                 : { $exists: true },
            'plaid.tokens.connect': { $exists: true, $ne: {} },
//			wallet                : { $exists: true },
//			'wallet.addresses'    : { $exists: true },
        };

        const selector = {
            _id   : 1,
            plaid : 1,
			wallet: 1,
        };

        User.find(query, selector).then(people => {

            if (!people || people.length === 0) {
                logger.log('There is no people information to process');
                return;
            }

            for (let i = 0; i < numberCpus; i += 1) {
                let worker = cluster.fork();

                worker.on('message', this.assignWork.bind(this, worker, people));
                worker.on('exit',    this.exitIfNoMoreWorkersLeft());
            }
        });
    },

    exitIfNoMoreWorkersLeft() {

        // Active workers live on cluster.workers Array
        if (Object.keys(cluster.workers).length === 0) {
            process.exit(0);
        }
    },

    /**
     * When worker has no job, It sends a 'ready' message.
     * We check if there are more people to work on. If we do, we send one person to process
     * If we ran out of people, we send a message to worker to end its process
     * @param {object} worker A worker instance
     * @param {Array}  people
     * @param {string} msg    The message received from worker
     */
    assignWork(worker, people, msg) {

        if (msg === 'ready') {
            const person = people.pop();

            if (person) {

                // NOTE: We assume user has only one bank account registered on the application
                const bankType = Object.keys(person.plaid.tokens.connect)[0];

				// NOTE: We assume user can donate to one NPO at a time
				const walletAddress = Object.keys(person.wallet.addresses)[0];

                // we send just what the worker needs
                worker.send({
                    _id    : person._id,
                    token  : person.plaid.tokens.connect[bankType],
					address: person.wallet.addresses[walletAddress],
                });
            } else {
                worker.send('finish');
            }
        }
    },
};

module.exports = Cluster;
