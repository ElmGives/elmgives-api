/**
 * Charity,
 * Used to store information about current user NPO's and banks associated
 */
'use strict';

const mongoose = require('mongoose');
const schema = require('./charitySchema');

module.exports = mongoose.model('Charity', schema);
