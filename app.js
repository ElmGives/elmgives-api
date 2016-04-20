/**
 * Main file.
 * Setup database, express based application
 *     logs
 *     routes
 *     middlewares
 *     CORS
 */
'use strict';

/**
 * Load environment variables
 */
require('dotenv').config();

/**
 * MongoDB configuration
 */
require('./config/database');

/**
 * Fast, unopinionated, minimalist web framework for node
 * https://github.com/strongloop/express
 */
const express = require('express');

/**
 * Node.js body parsing middleware
 * https://github.com/expressjs/body-parser
 */
const bodyParser = require('body-parser');

/**
 * A node.js package that provides an Express/Connect middleware to enable CORS
 * https://github.com/expressjs/cors
 */
const cors = require('cors');

const fourOhFour = require('./lib/fourOhFour');
const sendError = require('./lib/sendError');
const logRequest = require('./lib/logRequest');

const SEND_ERRORS = process.env.SEND_ERRORS;

let app = express();

/**
 * Recommended from Express documentation
 * @see  http://expressjs.com/en/advanced/best-practice-security.html
 */
app.disable('x-powered-by');

app.use(cors());
app.use(logRequest);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

/**
 * Require modules/routes/express applications and use their endpoints
 */
require('./modules')(app);

/**
 * Reject any other request to any other endpoint
 */

app.all('*', (request, response) => {

    //
    //  Lester, Some thoughts to consider
    //
    //  a couple of things of note here, can we please check to see if this is a POST or a GET before
    //  returning a 405?  If we're going to return a 405, we should be returning ALLOWS headers for what is allowable
    //
    //  An easier implementation would be to return a 404 here and not worry about the ALLOWS
    //
    //  Additionally, do we have HTTP_CONST_CODES defined somewhere that can be used here instead of magic number 405?
    //
    //  And finally, rather than an empty response, we need to return a standard API response with valid stat code/messages/etc
    //
    return response.status(405).send();
});

/**
 * catch 404 and forward to error handler
 */
app.use(fourOhFour);

/**
 * Send proper error message if any
 */
app.use(sendError(SEND_ERRORS));

module.exports = app;
