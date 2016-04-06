/**
 * Based on a date, check if a session still valid
 */
'use strict';

module.exports = expire => new Date(expire).getTime() > new Date().getTime();
