/**
 * Validate email
 * http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
'use strict';

const REGEX = process.env.EMAIL_REGEX || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = email => REGEX.test(email);
