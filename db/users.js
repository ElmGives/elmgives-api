/**
 * Seed database with default values, for development purposes
 */
'use strict';

require('../app');
const User = require('../users/user');
const users = require('./users.json');

let findOrInsert = (data) => {

    const query = {
        email: data.email
    };

    // For testing plaid service
    if (Math.random() * 10 < 5) {
        data.plaid = {
            tokens: {
                connect: {
                    wells: 'test_wells',
                },
            },
        };
    }

    return User
        .findOne(query)
        .then(user => user ? user : new User(data).save())
        .then(user => user)
        .catch(error => error);
};

let promises = users.map(user => findOrInsert(user));

Promise
    .all(promises)
    .then(values => {
        values.map(user => console.log(`user found or created ${user.email}`));
        process.exit(0);
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
