'use strict';

const Users = require('../users/user');

/**
 * We retrieve all users that have a [[Stripe]] attribute with either a [[token]] or a [[CustomerId]]
 * and those that have a [[pledges]] attribute
 * @param {generator} generator
 */
function getUsers(generator) {
  const query = {
    active: true,
    'stripe': {
      $exists: true,
    },
    'pledges': {
      $exists: true,
    },
  };
  
  const selector = {
    stripe: 1,
    pledges: 1,
  };
  
  Users
    .find(query, selector)
    .exec()
    .then(generator.next)
    .catch(generator.throw);
}

module.exports = getUsers;
