/**
 * Derive a wallet address from a cryptographic public key
 */
'use strict';

const crypto = require('crypto');
const Ripemd160 = require('ripemd160');
const prefix = '87'; // so that the derived addresses start with 'w'
const bs58check = require('bs58check');

module.exports = function deriveWalletAddress(publicKey) {
    let keyBuffer = new Buffer(publicKey, 'hex');
    let firstHash = crypto.createHash('sha256').update(keyBuffer).digest();
    let secondHash = new Ripemd160().update(firstHash).digest('hex');
    let extendedHash = prefix + secondHash;
    let base58Public = bs58check.encode(new Buffer(extendedHash, 'hex'));

    return Promise.resolve(base58Public);
};
