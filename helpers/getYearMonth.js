/**
 * Obtain the current date and month in YYYY-MM format
 */
'use strict';

module.exports = function (date) {
  if ((new Date(date)).toString() === 'Invalid Date') {
    date = (new Date()).toISOString();
  } else {
    date = (new Date(date)).toISOString();
  }
  return date.substr(0, date.indexOf('-', date.indexOf('-') + 1));
};
