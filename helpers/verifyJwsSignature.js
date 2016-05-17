/**
 * Verifies signature on an AWS message based on passed parameters
 */
'use strict';

const logger = require('../logger');
const stringify = require('json-stable-stringify');
const crypto = require('crypto');
const elliptic = require('elliptic');
const schemes = {
    ed25519: new elliptic.ec('ed25519')
};

module.exports = function verifyJwsSignature(jws, scheme, publicKey) {
    let hashValue = jws.hash.value;
    let signature = jws.signatures[0].signature;
    let verified  = null;
    scheme        = scheme || schemes.ed25519;

    // Preventive, reusable error object
    let error = new Error();
    error.status = 422;
    error.message = 'invalid-transaction-signature';
    error.details = `transaction hash: ${hashValue}`;

    let hash = crypto.createHash(jws.hash.type || 'sha256')
        .update(stringify(jws.payload)).digest('hex');
    if (hash !== hashValue) {
        logger.error(error);
        error.message = 'transaction-hash-mismatch';
        return Promise.reject(error);
    }

    try {
        verified = scheme.verify(hash, signature, publicKey, 'hex');
    } catch(err) {
        logger.error(err);
        return Promise.reject(error);
    }

    return verified ? Promise.resolve(true) : Promise.reject(error);
};
