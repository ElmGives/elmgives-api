'use strict';

require('dotenv').config();
require('../config/database');
require('./trigger')({month:true});
