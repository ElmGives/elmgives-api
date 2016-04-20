/**
 * Verifies signature on an AWS message based on passed parameters
 */
'use strict';

const logger = require('../logger');

module.exports = function verifyJwsSignature(jws, schema, publicKey) {
    let hash      = jws.hash.value;
    let signature = jws.signatures[0].signature;
    let verified  = null;

    try {
        verified = schema.verify(hash, signature, publicKey, 'hex');
    } catch(error) {
        logger.error({ err: error });
        return Promise.reject(new Error('invalid signature'));
    }

    return Promise.resolve(verified);
};
