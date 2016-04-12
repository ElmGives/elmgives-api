/**
 * Returns true if role is admin role
 */

'use strict';

const ADMIN = 'admin';

module.exports = role => role.title === ADMIN;
