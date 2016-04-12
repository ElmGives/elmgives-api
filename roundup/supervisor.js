/**
 * Runs the roundup process using cores available for this task
 */

'use strict';

require('dotenv').config();

const CORES_AVAILABLE = require('os').cpus().length;

const cluster = require('cluster');
const Cluster = require('./cluster');
const Worker  = require('./worker');

if (cluster.isMaster) {

    // TODO: Determine how many workers the cluster can spawn
    Cluster.runWith(CORES_AVAILABLE);
}
else {
    const worker = Object.create(Worker);
    worker.init();
}
