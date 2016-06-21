'use strict';

const Users = require('../users/user');

/**
 * Add on Users collection [[customer]] property
 * @param {object}    user
 * @param {String}    institution
 * @param {generator} generator
 */
function addCustomerIdOnDatabase(user, institution, generator) {
  const query = {
    _id: user._id,
  };
  
  // NOTE: with nodejs v6+ we can use computed properties
  let action = {
    $set: {},
  };
  
  action.$set[`stripe.${institution}.customer`] = user.stripe[institution].customer;
  
  Users
    .update(query, action)
    .exec()
    .then(update => generator.next(update))
    .catch(error => generator.throw(error));
}

module.exports = addCustomerIdOnDatabase;
