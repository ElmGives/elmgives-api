'use strict';

require('dotenv').config();
require('../config/database');
require('./trigger').all({month:true});
