'use strict';

const tape = require('tape');
const Address = require('../../../addresses/address');
const types = require('../types');
const required = require('../required');

tape('Address model', test => {
    test.plan(10);

    let address = new Address({});
    let values = address.schema.paths;

    types(['address', 'keys.scheme', 'keys.public', 'latestTransaction'], values, test, 'String');
    types(['createdAt', 'updatedAt'], values, test, 'Date');

    address.validate(error => {
        let fields = [
            'address', 'keys.public', 'latestTransaction'
        ];
        required(fields, error.errors, test);
    });

    new Address({
        address: 'wfdqxmkBNGrcyckxi4QedkaivuzD2X193a',
        keys: {
            scheme: 'ed25519',
            public: '043e3dc970bbbddfc834d23a18b9a7b91b0968a5007e5184aed063680f82486831628aa3caf067194c3897b5bf667f9f7c2eed667db9f2f8b3224263213bfa6c2c'
        },
        latestTransaction: '20f38197ea557988946b867100185f26b2efd99d399bf5f4937a9968fd22bb84'
    }).validate(error => test.equal(undefined, error, 'valid with attributes'));
});
