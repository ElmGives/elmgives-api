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
