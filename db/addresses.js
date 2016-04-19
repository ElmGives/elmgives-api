/**
 * Seed database with default values, for development purposes
 */
'use strict';
​
require('../app');
const Address = require('../addresses/address');
let addresses = require('./addresses.json');
​
let findOrInsert = (data) => {
​
    const query = {
        'hash.value': data.hash.value
    };
​
    return Address
        .findOne(query)
        .then(address => address ? address : new Address(data).save())
        .catch(error => error);
};
​
function all(promises) {
    Promise
        .all(promises)
        .then(values => {
            values.map(address => console.log(`address found/created ${address.hash.value}`));
            process.exit(0);
        }, reason => {
            console.log(reason);
            process.exit(1);
        });
}
​
let promises = addresses.map(address => findOrInsert(address));
all(promises);