'use strict';

/**
 * This script is intended to be run only when automatic process fails and it's necessary to run monthly
 * charges manually
 */

const chargeProcess = require('../monthly/charge_process');

chargeProcess();