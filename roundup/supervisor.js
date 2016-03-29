/**
 * Runs the roundup process using cores available for this task
 */

'use strict';

const cluster = require('cluster');
const CPUs = require('os').cpus().length;

const Cluster = require('./cluster');
const Worker = require('./worker');

if (cluster.isMaster) {
    Cluster.runWith(1);    // TODO: Leave CPUs instead of manual 1
}
else {
//    Object.create(Worker).request();
    const worker = Object.create(Worker);
    worker.init();
}
