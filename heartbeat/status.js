/**
 * Middleware to check the status of the API
 * Check:
 *     - connection to database
 *     - ability to perform queries
 */

'use strict';

const Npo = require('../npos/npo');
const mongoose = require('mongoose');
const logger = require('../logger');
const defaultResponse = {
    data: {
        status: 'ok!'
    }
};

function status(request, response, next) {

    if (!mongoose.connection.readyState) {
        let error = new Error();
        error.message = 'Cant process your request';
        error.status = 500;

        logger.error({
            err: error
        }, 'Cant connect to database');

        return next(error);
    }

    const select = {
        _id: 1
    };

    Npo
        .find({}, select)
        .then(() => response.json(defaultResponse))
        .catch(next);
}

module.exports = status;
