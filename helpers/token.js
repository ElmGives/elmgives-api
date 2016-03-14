/**
 * Generate random token
 */
'use strict';

/**
 * Generate random IDs and avoid collisions.
 * https://github.com/substack/node-hat
 */
const hat = require('hat');

module.exports = () => hat();
