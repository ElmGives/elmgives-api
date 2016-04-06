/**
 * Handle logs
 * Redirect error logs to third service, papertrails perhabs?
 * @see https://github.com/trentm/node-bunyan#levels
 */
'use strict';

/**
 * a simple and fast JSON logging module for node.js services
 * @see  https://github.com/trentm/node-bunyan
 */
const bunyan = require('bunyan');

const serializer = require('./helpers/requestSerializer');
const querySerializer = require('./helpers/querySerializer');

/**
 * Used on development
 * @see  https://github.com/trentm/node-bunyan#stream-type-rotating-file
 */
let logToFile = {
    level: 'error',
    type: 'rotating-file',
    path: './logs/error.log',
    period: '1d', // daily rotation
    count: 30 // keep 3 back copies
};

const SEND_LOGS = process.env.SEND_LOGS;

let streams = [
    /**
     * Log info and above to stdout
     */
    {
        level: 'info',
        stream: process.stdout
    }
];

if (!SEND_LOGS) {
    /**
     * Used to track errors on development
     */
    streams.push(logToFile);
} else {
    // Stream error logs on production to third service
}

let log = bunyan.createLogger({
    name: 'elm-api',
    src: false,
    serializers: {
        /**
         * This property must be named `req`, DON'T change it! It's an order!
         */
        req: serializer,
        dbQuery: querySerializer,
        err: bunyan.stdSerializers.err
    },
    streams: streams
});

module.exports = log;
