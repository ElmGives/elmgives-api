/**
 * Seed database with default values, for development purposes
 */
'use strict';

require('../app');
const Bank = require('../banks/bank');
const User = require('../users/user');
let banks = require('./banks.json');
const query = {
    email: 'homer@elm.com'
};

let findOrInsert = (data) => {

    const query = {
        name: data.name
    };

    return Bank
        .findOne(query)
        .then(bank => bank ? bank : new Bank(data).save())
        .then(bank => {
            
            if (bank.type === 'wells') {
                const query = {
                    active: true,
                    plaid: {
                        $exists: true
                    },
                    'plaid.tokens.connect': {
                        $exists: true,
                        $ne: {}
                    },
                    pledges: {
                        $exists: true
                    },
                    'pledges.addresses': {
                        $exists: true
                    },
                };
                
                const newBankId = {
                    $set: {
                        'pledges.0.bankId': bank._id,
                    },
                };
                
                return User
                    .update(query, newBankId)
                    .then(() => bank);
            }
            
            return bank;
        });
};

function all(promises) {
    Promise
        .all(promises)
        .then(values => {
            values.map(bank => console.log(`bank found/created ${bank.name}`));
            process.exit(0);
        }, reason => {
            console.log(reason);
            process.exit(1);
        });
}

User
    .findOne(query)
    .then(user => {

        let updated = banks.map(bank => {
            bank.userId = user._id;
            return bank;
        });

        let promises = updated.map(bank => findOrInsert(bank));
        all(promises);
    });
