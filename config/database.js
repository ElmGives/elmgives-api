/**
 * Connect to Mongo Database
 * @see  http://mongoosejs.com/docs/connections.html
 */
'use strict';

const mongoose = require('mongoose');
const logger = require('../logger');
const DB_CONNECTION_TIMEOUT = process.env.DB_CONNECTION_TIMEOUT || 5000;

let timeout = 0;

mongoose.Promise = global.Promise;

mongoose.set('debug', function(coll, method, query, doc, options) {
    let set = {
        coll: coll,
        method: method,
        query: query,
        doc: doc,
        options: options
    };

    logger.info({
        dbQuery: set
    });
});

let db = mongoose.connection;
let mongoUrl = 'mongodb://host:port/name';

mongoUrl = mongoUrl
    .replace('host', process.env.DB_HOST)
    .replace('port', process.env.DB_PORT)
    .replace('name', process.env.DB_NAME);

let options = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    server: {
        'auto_reconnect': true,
        poolSize: 5,
        socketOptions: {
            keepAlive: 300000,
            connectTimeoutMS: 30000
        },
    }
};

mongoose.connect(mongoUrl, options);

db.on('connecting', () => {
    logger.info('connecting to MongoDB...');
});

/**
 * Log any connection error
 */
db.on('error', function(error) {
    logger.error({
        err: error
    });

    mongoose.disconnect();
});

db.once('open', function callback() {
    logger.info('Mongo DB connection established');
});

/**
 * Need more detail on this
 */
db.on('disconnected', function() {
    logger.warn('MongoDB disconnected!');

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(function() {
        logger.info(`Trying to connect again : ${DB_CONNECTION_TIMEOUT}/s`);
        mongoose.connect(mongoUrl, options);
    }, DB_CONNECTION_TIMEOUT);
});

db.on('reconnected', function() {
    clearTimeout(timeout);
    logger.info('Mongo DB reconnected');
});

/**
 * http://stackoverflow.com/questions/16226472/mongoose-autoreconnect-option
 */
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        logger.info('Force to close the MongoDB conection');
        process.exit(0);
    });
});
