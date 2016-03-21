/**
 * Seed database with default values, for development purposes
 */
'use strict';

require('../app');
const Npo = require('../npos/npo');
const User = require('../users/user');
let npos = require('./npos.json');
const query = {
    email: 'homer@elm.com'
};

let findOrInsert = (data) => {

    const query = {
        name: data.name
    };

    return Npo
        .findOne(query)
        .then(npo => npo ? npo : new Npo(data).save());
};

function all(promises) {
    Promise
        .all(promises)
        .then(values => {
            values.map(npo => console.log(`npo found/created ${npo.name}`));
            process.exit(0);
        }, reason => {
            console.log(reason);
            process.exit(1);
        });
}

User
    .findOne(query)
    .then(user => {

        let updated = npos.map(npo => {
            npo.userId = user._id;
            return npo;
        });

        let promises = updated.map(npo => findOrInsert(npo));
        all(promises);
    });
