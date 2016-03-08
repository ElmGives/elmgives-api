/**
 * Validate URL
 */
'use strict';

let url = require('url');

module.exports = function(value) {
    let valid = url.parse(value);
    return !!valid.protocol && !!valid.slashes && !!valid.path && !!valid.host;
};
