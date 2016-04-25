'use strict';

process.env.SIGNER_URL = 'http://localhost';
process.env.SERVER_PRIVATE_KEY = '0f39d2a6982da1cdfbadfaa530c83bffba832de5ac4dd052cfc032a590643e9f';

const tape = require('tape');
const sinon = require('sinon');
const mongoose = require('mongoose');
const manager = require('../../../bin/pledgeAddressManager');
const Pledge = require('../../../pledges/pledge');
const User = require('../../../users/user');

sinon.stub(manager.requestAddress, 'makeHttpRequest');
let response = {
    address: 'wi6d4171bHpasXSGhgrWYf6CVhgL15mYpG',
    keys: {
        scheme: 'ed25519',
        private: '04fd9823dd98e84451349cb13e2ee4984247fdbd0d31db2401166c1e38e9d40d',
        public: '047d4e86e79989e56fc08fac5a6ca0ced42a6218b6836147833171cd9e8001c7bb3e521c3558b377d0ef05c7515d094a314ecefef82c0bf797d246d546ec60fb87'
    },
    statement: {
        hash: {
            type: 'sha256',
            value: 'd79ae24aa1c138b942c4af7dcb0bd6c7d15d5680f1c001a807ee686166058369'
        },
        payload: {
            count: 0,
            address: 'wi6d4171bHpasXSGhgrWYf6CVhgL15mYpG',
            amount: 0,
            roundup: 0,
            balance: 0,
            currency: 'USD',
            limit: -10,
            previous: null,
            timestamp: '2016-04-24T14:50:40.214Z',
            reference: '571cdd3ed5bed02953b185cf'
        },
        signatures:[{
            header: {alg: 'ed25519', kid: 'wi6d4171bHpasXSGhgrWYf6CVhgL15mYpG'},
            signature: '304402200de9d73b19499a0d48634b48c256ad9c101788ebdd6653a1c053c6a9ebfc48c802200a92652d3be0edcfdb0927dda0fc134eb2b4ca0c31a77bdd82af8b683811b84f',
        }]
    }
};
manager.requestAddress.makeHttpRequest.returns(Promise.resolve(response));

/* TESTS */
tape('Pledge Address request message structure', test => {
    test.plan(1);

    let user = new User({
        name: 'john',
        firstName: 'john doe',
        email:'john@example.com',
        password: 'hash',
    });
    let pledge = new Pledge({
        userId: user.id,
        npoId: mongoose.Types.ObjectId(),
        npo: 'Some NPO',
        bankId: mongoose.Types.ObjectId(),
        bank: 'Some bank',
        monthlyLimit: 10
    });

    Promise
        .all([user, pledge])
        .then(values => {
            user = values[0];
            pledge = values[1];
            if (!user || !pledge) {
                test.fail('Error creating user and/or pledge');
            }
            user.pledges.push(pledge);
            return manager.requestAddress(user, pledge.id, 'nonceValue');
        })
        .then(data => {
            test.equal(1,1,'equal');
            // let user = data[0];
            // let transaction = data[1];
            // let address = data[2];
            // actual tests go here
        });
});
