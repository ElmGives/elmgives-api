/**
 * Helper to return a Date object plus `expire` hours from params
 */
'use strict';

const HOUR = 60 * 60 * 1000;

module.exports = expire => new Date(new Date().getTime() + (expire * HOUR));
