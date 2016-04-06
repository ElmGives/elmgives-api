/**
 * Runs and controls every forked process and passes them data to work trying
 * to balance the load and handling a child failure
 */

'use strict';

const cluster = require('cluster');
const Users = require('../users/user');

// TODO: remove this test code when tests end
// const Users = {
//     find() {
//         return this;
//     },
//
//     toArray(callback) {
//
//         callback(null, [
//             {
//                 _id: 1,
//                 plaid: {
//                     tokens: {
//                         connect: {
//                             wells: 'test_wells',
//                         },
//                     },
//                 },
//             },
//             {
//                 _id: 2,
//                 plaid: {
//                     tokens: {
//                         connect: {
//                             wells: 'test_wells',
//                         },
//                     },
//                 },
//             },
//             {
//                 _id: 3,
//             },
//             {
//                 _id: 4,
//                 plaid: {
//                     tokens: {
//                         connect: {
//                             wells: 'test_wells',
//                         },
//                     },
//                 },
//             },
//             {
//                 _id: 5,
//             },
//             {
//                 _id: 6,
//                 plaid: {
//                     tokens: {
//                         connect: {
//                             wells: 'test_wells',
//                         },
//                     },
//                 },
//             },
//         ]);
//     }
// };

module.exports = {

    /**
     * Run workers in order to process all work.
     * @param {number} numberCpus The number of workers this cluster can spawn
     */
    runWith(numberCpus) {

        Users.find({ active: true }).toArray((err, people) => {

            if (err) {
                console.log(err);
                return;
            }

            if (!people || people.length === 0) {
                console.log('There is no people information to process');
                return;
            }

            // we need the list of people that has the plaid access_token inside in order to request transaction history
            people = people.filter(person => (person.plaid && person.plaid.tokens && person.plaid.tokens.connect && Object.keys(person.plaid.tokens.connect).length));

            for (let i = 0; i < numberCpus; i += 1) {
                let worker = cluster.fork();

                worker.on('exit', () => {

                    if (Object.keys(cluster.workers).length === 0) {
                        console.log('There are no workers left');
                        process.exit(0);
                    }
                });

                worker.on('message', (msg) => {

                    if (msg === 'ready') {
                        const person = people.pop();

                        if (person) {

                            // We assume user has only one banck account registered on the application
                            const bankType = Object.keys(person.plaid.tokens.connect)[0];

                            // we send just what the worker needs
                            worker.send({
                                _id: person._id,
                                token: person.plaid.tokens.connect[bankType],
                            });
                        }
                        else {
                            worker.send('finish');
                        }
                    }
                });
            }
        });
    },
};
