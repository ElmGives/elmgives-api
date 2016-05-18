'use strict';

const Users = require('../users/user');

/**
 * We remove [[token]] attribute when we are certain that a user has a [[stripe.customerId]] because
 * it's useless once [[customerId]] is created
 * @param {object}    user
 * @param {String}    institution We can have more than one stripe token, but we need to remove what is been analyzed
 * @param {generator} generator
 */
function removeStripeToken(user, institution, generator) {
  const query = {
    _id: user._id,
  };
  
  let action = {
    $unset: {},
  };
  
  action.$unset[`stripe.${institution}.token`] = '';
  
  Users
    .update(query, action)
    .exec()
    .then(generator.next)
    .catch(generator.throw);
}

module.exports = removeStripeToken;