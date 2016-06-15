'use strict';

const Npos = require('../npos/npo');
const mongoose = require('mongoose');

/**
 * Finds all NPOs that have a Stripe accountId for making payments on their accouts
 * We store this list on a global variable for later. We could pass this list between functions but
 * that would make the code difficult to read. When using nodejs v6+ this can be achieved using destructuring
 * @param {ObjectId}  npoId
 * @param {generator} generator
 */
function getNpo(npoId, generator) {
  const query = {
    _id: mongoose.Types.ObjectId(npoId),
    active: true,
    'stripe.accountId': {
      $exists: true,
    },
  };
    
  const selector = {
    stripe: 1,
    name: 1,
  };
    
  Npos
    .findOne(query, selector)
    .exec()                     // this forces to return a real Promise
    .then(npo => generator.next(npo))
    .catch(error => generator.throw(error));
}

module.exports = getNpo;