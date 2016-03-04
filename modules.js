/**
 * Require modules and attach them to the application.
 * Basically set new routes for express or you can also mount new express apps
 */
'use strict';

const npos = require('./npos');

module.exports = app => {
    app
        .use(npos);
};
