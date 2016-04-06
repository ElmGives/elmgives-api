/**
 * Generic success response helper
 */
'use strict';

module.exports = (res, status) => data => res.status(status || 200).json(data);
