'use strict';

const tape = require('tape');
const deriveWalletAddress = require('../../../helpers/deriveWalletAddress');

const publicKeys = [
    '0478b45b3962f258693e8ae9ec7c193993fd0e9bdd37a7b0cd57391c3c1d7dc67503e1f5acceb3c3ce62903244fbaa56e645321141015c5c2eb29043449856916f',
    '04732015f849b717b414751f6a205190634f36b4824bdc22f5ce185898b2be98c45d5f57ca4432f39181d5982aac7e74c786c12b050c54f60c4920abfc417b41e8',
    '0434131c9b38c2c9bd85d5363519f228c822bae811e10a39ec1cef147f3bc77dad18302d798d4c3485f859197f1fa4fd856d79ae83561b8fdc34ca6f9015d34fb6',
    '041c403e40fb2e6f832868c21b124b47bb061ef00df960c659593f186174992e6e5c4ad01a33b5817d176a7326ef096851cc8076e4803f7939420449dd40b15185',
    '046debbb1f67810989c12a0a5bc31241503c0f8ccdb2c8ce36472ecd4419e0a3ae502308ea144bb0ad1f4e630e53d9e5b9e5f066831dfbdbbfc1042ab798fb14af'
];
const addresses = [
    'wcCk7adCK1TLmubvsQwdbPGDLhqAd1KdxE',
    'wfuRLAv9wTzDzUWuvpcNmijgUjbR5ULG2K',
    'wfxyBhJvHV6JjgPDdxasWkgGuBcQ86v3Sr',
    'wV7yVx7wRtN3gzTcmTL9bUh3tucec2gJPB',
    'wPQWqMbcQEqwqG6JLWzP3CfHMqFHxyUkJY'
];

tape('Derive Wallet Address', test => {
    test.plan(publicKeys.length);

    publicKeys.map((publicKey, index) => {
        deriveWalletAddress(publicKey)
            .then(address => {
                test.equal(address, addresses[index], `derived address is ${address}`);
            });
    });
});
