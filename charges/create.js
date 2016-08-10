/**
 * 
 */
'use strict';

const Charge = require('./charge');

module.exports = function create(params) {
    return new Charge(params).save();
};
