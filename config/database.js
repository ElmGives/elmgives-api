/**
 * Connect to Mongo Database
 * @see  http://mongoosejs.com/docs/connections.html
 */
'use strict';

const mongoose = require('mongoose');
const log = require('../logger');

mongoose.Promise = global.Promise;

mongoose.set('debug', function(coll, method, query, doc, options) {
    let set = {
        coll: coll,
        method: method,
        query: query,
        doc: doc,
        options: options
    };

    log.info({
        dbQuery: set
    });
});

let db = mongoose.connection;
let mongoUrl = 'mongodb://user:pass@host:port/name';

mongoUrl = mongoUrl
    .replace('user:', process.env.DB_USER)
    .replace('pass@', process.env.DB_PASS)
    .replace('host', process.env.DB_HOST)
    .replace('port', process.env.DB_PORT)
    .replace('name', process.env.DB_NAME);

mongoose.connect(mongoUrl, {
    server: {
        'auto_reconnect': true
    }
});

/**
 * Log any connection error
 */
db.on('error', function(error) {
    log.info({error: error});
});

db.once('open', function callback() {
    console.log('MongoDB connection is established');
});

/**
 * Need more detail on this
 */
db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(process.env.MONGO_URL, {
        server: {
            'auto_reconnect': true
        }
    });
});

db.on('reconnected', function() {
    console.info('MongoDB reconnected!');
});
