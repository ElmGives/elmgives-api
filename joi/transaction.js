const joi = require('joi');

const minHash = 64;
const maxHash = 128;
const validHashes = ['sha256', 'sha512'];
const validSignatures = ['ed25519'];

const schema = joi.object({
  hash: joi.object({
    type: joi.string().required().valid(validHashes),
    value: joi.string().required().hex().min(minHash).max(maxHash)
  }).required(),
  payload: joi.object({
    count: joi.number().required(),
    address: joi.string().required().alphanum().min(26).max(35), // like Bitcoin addresses
    amount: joi.number().required(),
    roundup: joi.number().required(),
    balance: joi.number().required(),
    currency: joi.string().min(3).max(3).example('USD').required(),
    limit: joi.number().required(),
    previous: joi.string().required().hex().allow(null).min(minHash).max(maxHash),
    timestamp: joi.date().required(),
    reference: joi.string(),
    info: joi.string()
  }).required(),
  signatures: joi.array().items({
    header: {
      alg: joi.string().required().valid(validSignatures),
      kid: joi.string().required()
    },
    signature: joi.string().required().hex()
  })
});

module.exports = schema;
