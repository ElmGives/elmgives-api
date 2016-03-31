/**
 * Runs the roundup process using cores available for this task
 */

'use strict';

const cluster = require('cluster');
const CPUs = require('os').cpus().length;

const Cluster = require('./cluster');
const Worker = require('./worker');

if (cluster.isMaster) {
    Cluster.runWith(CPUs);    // TODO: Determine how many workers the cluster can spawn
}
else {
    const worker = Object.create(Worker);
    worker.init();
}
